import { sheets } from '@/sheets';
import { rows } from '@/rows';
import { SmartsheetSchema } from '@/schema/schema-definitions';
import { z } from 'zod';
import { compareItems } from '@/utils/compare-items';
import { mapColumnsToFormats, mapColumnsToObject, mapObjectToColumns } from '@/utils/mapping';
import { getCombinedZodSchema } from '@/utils/schema/get-combined-zod-schema';
import { errorHandler } from '@/utils/error-handler';
import { getSmartsheetFetcher } from '@/utils/fetcher';
import { _mixFetcherIntoAPI } from '@/utils/interface-exposure';
import { NewRow, PreparedRow, PreparedSheet, ProcessingRow } from '@/utils/rich-row-types';
import { _checkSchemaValidity } from '@/utils/schema/validity';

type LoadSheetOptions<Schema extends SmartsheetSchema> = {
  name: string;
  schema: Schema;
  createIfNotExist?: boolean;
}

/**
 * Load a sheet from Smartsheet.
 * @param sheetSetup
 * @param options
 * @private
 */
async function _loadSheet<Schema extends SmartsheetSchema>(
  sheetSetup: LoadSheetOptions<Schema>,
  options: SmartsheetSDKMetaOptions,
): Promise<PreparedSheet<Schema>> {
  const SmartsheetAPI = prepareSmartsheetAPI(options);
  return await errorHandler(async () => {
    const {
      name,
      schema,
      ...options
    } = sheetSetup;
    _checkSchemaValidity(schema);
    const sheets = await SmartsheetAPI.sheets.listSheets();
    const foundSheet = sheets.find((sheet) => sheet.name === name);
    if (!foundSheet && !options.createIfNotExist) {
      throw new Error(`Sheet "${name}" not found.`);
    }

    let sheetId: number;
    if (!foundSheet) {
      const createdSheet = await SmartsheetAPI.sheets.createSheetIntoSheets({
        name: name,
        columns: Object.entries(schema).map(([_, columnDefinition]) => {
          const columnName = columnDefinition.columnName;
          return {
            title: columnName,
            type: columnDefinition.columnType,
            options: 'options' in columnDefinition ? columnDefinition.options?._def.values : undefined,
            primary: columnDefinition.primary,
          };
        }),
      });
      sheetId = createdSheet.id;
    } else {
      sheetId = foundSheet.id;
    }

    const sheet = await SmartsheetAPI.sheets.getSheet({ sheetId: sheetId });
    const columnsMatchedWithSchema: Record<number, string> = {}; // Key: column id, value: column title.
    for (const column of sheet.columns) {
      const columnKey = Object.keys(schema).find((key) => schema[key].columnName === column.title);
      if (!columnKey) {
        continue;
      }
      const columnDefinition = schema[columnKey];
      // Check if the type matches.
      if (column.type !== columnDefinition.columnType) {
        throw new Error(`Column "${column.title}" type mismatch. Expected "${columnDefinition.columnType}", but got "${column.type}".`);
      }
      if ('options' in columnDefinition && (!column.options || !compareItems(columnDefinition.options?._def.values, column.options))) {
        throw new Error(`Column "${column.title}" options mismatch. Expected "${columnDefinition.options?._def.values}", but got "${column.options}".`);
      }
      columnsMatchedWithSchema[column.id] = columnKey;
    }

    const combinedSchema = getCombinedZodSchema(schema);
    const preparedRowSchema = z.object(combinedSchema).merge(z.object({
      id: z.number(),
    })) as z.ZodType<ProcessingRow<Schema>>;

    function updateRow(row: PreparedRow<Schema>) {
      return SmartsheetAPI.rows.updateRow({
        sheetId: sheetId,
        rowId: row.id,
        data: {
          cells: mapObjectToColumns(sheet, schema, row, row.formats),
        },
      });
    }

    // TODO: Assign the updated object back to the row object (e.g. refresh).
    return {
      getSheet: async () => sheet,
      getColumns: async () => sheet.columns,
      getRows: async () => {
        return sheet.rows.map((row) => {
          const obj: Record<string, unknown> = {};
          for (const cell of row.cells) {
            const columnName = columnsMatchedWithSchema[cell.columnId];
            if (!columnName) {
              continue;
            }
            obj[columnName] = cell.value;
          }
          obj.id = row.id;
          return {
            ...preparedRowSchema.parse(obj),
            formats: mapColumnsToFormats(row, schema, columnsMatchedWithSchema),
            update: async function() {
              await updateRow(this);
            },
          } satisfies PreparedRow<Schema>;
        });
      },
      insertRow: async (row: NewRow<Schema>) => {
        const createdRow = await SmartsheetAPI.rows.insertRow({
          sheetId: sheetId,
          row: {
            cells: mapObjectToColumns(sheet, schema, row),
          },
        });
        return {
          ...mapColumnsToObject(createdRow, schema, preparedRowSchema, columnsMatchedWithSchema),
          update: async function() {
            await updateRow(this);
          },
        } satisfies PreparedRow<Schema>;
      },
      getRow: async (rowId: number) => {
        const row = await SmartsheetAPI.rows.getRow({
          sheetId: sheetId,
          rowId: rowId,
        });
        if (!row) {
          throw new Error(`Row "${rowId}" not found.`);
        }
        return {
          ...mapColumnsToObject(row, schema, preparedRowSchema, columnsMatchedWithSchema),
          update: async function() {
            await updateRow(this);
          },
        } satisfies PreparedRow<Schema>;
      },
    } satisfies PreparedSheet<Schema>;
  });
}

type SmartsheetSDKMetaOptions = {
  accessToken: string;
};

/**
 * This function creates a Smartsheet SDK instance for you to access the Smartsheet API conveniently and type-safely.
 * @param options - The options for the Smartsheet configuration.
 */
export function prepareSmartsheetSDK(options: SmartsheetSDKMetaOptions) {
  if (!options.accessToken) {
    throw new Error('Missing Smartsheet API Token.');
  }
  return {
    /**
     * Load a sheet from Smartsheet.
     * It checks if the sheet schema matches to corresponding columns configuration online, and throws an error if not.
     * You can configure to create the sheet if it does not exist. Otherwise, it will throw an error if the sheet does not exist.
     * @param sheetSetup - The sheet setup options (put basic configurations here).
     */
    loadSheet: <Schema extends SmartsheetSchema>(sheetSetup: LoadSheetOptions<Schema>) => {
      return _loadSheet(sheetSetup, options);
    },
  };
}

/**
 * This function creates a Smartsheet API instance for you to access the Smartsheet API with type safety.
 * @param options - The options for the Smartsheet configuration.
 */
export function prepareSmartsheetAPI(options: SmartsheetSDKMetaOptions) {
  if (!options.accessToken) {
    throw new Error('Missing Smartsheet API Token.');
  }
  const fetcher = getSmartsheetFetcher(options.accessToken);
  return {
    sheets: _mixFetcherIntoAPI(sheets, fetcher),
    rows: _mixFetcherIntoAPI(rows, fetcher),
  };
}

// Export the rest of the exported classes, functions, and types from the other files.
export * from '@/sheets';
export * from '@/rows';
export * from '@/columns';
export * from '@/cells';
export * from '@/schema/schema-definitions';
