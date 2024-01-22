import {
  SmartsheetAPI,
  defineColumn,
  SmartsheetColumnType,
  SmartsheetSymbol, SmartsheetColor,
} from 'smartsheet-typescript';
import { z } from 'zod';

const OpportunitySheetSchema = {
  projectId: defineColumn({
    columnName: 'Project ID #',
    columnType: SmartsheetColumnType.TEXT_NUMBER,
    primary: true,
  }),
  primaryOwner: defineColumn({
    columnName: 'Primary Owner',
    columnType: SmartsheetColumnType.TEXT_NUMBER,
  }),
  status: defineColumn({
    columnName: 'Status',
    columnType: SmartsheetColumnType.PICKLIST,
    options: z.enum(['Active', 'Inactive']),
  }),
  rating: defineColumn({
    columnName: 'Rating',
    columnType: SmartsheetColumnType.PICKLIST,
    symbol: SmartsheetSymbol.STAR_RATING,
    options: z.enum(['Empty', 'One', 'Two', 'Three', 'Four', 'Five']),
  }),
};

async function main() {
  const opportunitySheet = await SmartsheetAPI.prepareSheet({
    name: 'Opportunity',
    schema: OpportunitySheetSchema,
    createIfNotExist: true,
  });

  const sheet = await opportunitySheet.getSheet();
  const row = await opportunitySheet.getRow(sheet.rows[0].id);
  console.log('row:', row);

  row.formats.status.backgroundColor = SmartsheetColor.ORANGE_LIGHT;
  row.formats.status.textColor = SmartsheetColor.RED_DARK;
  await row.update();

  const updatedRow = await opportunitySheet.getRow(sheet.rows[0].id);
  console.log('updatedRow:', updatedRow);

  // await opportunitySheet.insertRow({
  //   projectId: '123',
  //   primaryOwner: '456',
  //   status: 'HHH',
  // });

  // TODO: Implement a function for the code below.
  // const updatedRow = await SmartsheetAPI.rows.updateRow({
  //   sheetId: 7462804994871172,
  //   rowId: rowIds[0],
  //   data: {
  //     cells: [
  //       {
  //         columnId: 6441356042915716,
  //         value: 'Test 222',
  //       },
  //     ],
  //   },
  // });
  // console.log(updatedRow);
}

main();
