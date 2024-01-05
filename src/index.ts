import { SmartsheetAPI } from '@/smartsheet-sdk';

// TODO: Organize them to e2e tests for ensuring the SDK safety in future production usage.
async function main() {
  // const sheets = await SmartsheetAPI.sheets.listSheets();
  // console.log(sheets);
  // const createdSheet = await SmartsheetAPI.sheets.createSheetIntoSheets({
  //   name: 'Test Sheet',
  //   columns: [
  //     {
  //       title: 'Test Column',
  //       type: 'TEXT_NUMBER',
  //       primary: true,
  //     },
  //   ],
  // });
  // console.log(createdSheet);
  const testSheet = await SmartsheetAPI.sheets.getSheet({
    sheetId: 7462804994871172,
  });
  console.log(testSheet);
  const rowIds = testSheet.rows.map((row) => row.id);
  console.log(rowIds);
  // const createdRow = await SmartsheetAPI.rows.insertRow({
  //   sheetId: 7462804994871172,
  //   row: {
  //     cells: [
  //       {
  //         columnId: 6441356042915716,
  //         value: 'Test',
  //       },
  //     ],
  //   },
  // });
  // console.log(createdRow);
  const updatedRow = await SmartsheetAPI.rows.updateRow({
    sheetId: 7462804994871172,
    rowId: rowIds[0],
    data: {
      cells: [
        {
          columnId: 6441356042915716,
          value: 'Test 222',
        },
      ],
    },
  });
  console.log(updatedRow);
}

main();
