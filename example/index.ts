import { SmartsheetAPI } from 'smartsheet-typescript';
import { defineColumn } from 'smartsheet-typescript/dist/schema/schema-definitions';
import { z } from 'zod';
import { SmartsheetColumnType } from 'smartsheet-typescript/dist/columns';
import { SmartsheetSymbol } from 'smartsheet-typescript/dist/schema/schema-definitions';

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
    options: z.enum(['Active', 'Inactive']),
  }),
};

async function main() {
  const opportunitySheet = await SmartsheetAPI.prepareSheet({
    name: 'Opportunity',
    schema: OpportunitySheetSchema,
    createIfNotExist: true,
  });

  console.log(opportunitySheet.getSheet());

  // await opportunitySheet.insertRow({
  //   projectId: 123,
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
