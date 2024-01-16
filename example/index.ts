import { SmartsheetAPI } from 'smartsheet-typescript';
import { defineColumn } from 'smartsheet-typescript/src/schema/schema-definitions';

const OpportunitySheetSchema = {
  projectId: defineColumn({
    columnName: 'Project ID #',
    columnType: 'TEXT_NUMBER',
    primary: true,
  }),
  primaryOwner: defineColumn({
    columnName: 'Primary Owner',
    columnType: 'TEXT_NUMBER',
  }),
  status: defineColumn({
    columnName: 'Status',
    columnType: 'PICKLIST',
    options: ['Active', 'Inactive'],
  }),
};

async function main() {
  const opportunitySheet = await SmartsheetAPI.prepareSheet({
    name: 'Opportunity',
    schema: OpportunitySheetSchema,
    createIfNotExist: true,
  });

  console.log(opportunitySheet.getRows());

  await opportunitySheet.insertRow({
    projectId: '123',
    primaryOwner: '456',
    status: 'HHH',
  });

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
