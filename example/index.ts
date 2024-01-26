import {
  defineColumn,
  SmartsheetColumnType, SmartsheetCurrency,
  SmartsheetNumberFormat,
  SmartsheetSymbol,
} from 'smartsheet-typescript';
import { z } from 'zod';
import { SmartsheetSDK } from '@/sdk-preparation';

const SampleSheetSchema = {
  column1: defineColumn({
    columnName: 'Column 1',
    columnType: SmartsheetColumnType.TEXT_NUMBER,
    primary: true,
  }),
  column2: defineColumn({
    columnName: 'Column 2',
    columnType: SmartsheetColumnType.TEXT_NUMBER,
  }),
  column3: defineColumn({
    columnName: 'Column 3 (Select List)',
    columnType: SmartsheetColumnType.PICKLIST,
    options: z.enum(['Option 1', 'Option 2', 'Option 3']),
  }),
  column4: defineColumn({
    columnName: 'Column 4 (Rating)',
    columnType: SmartsheetColumnType.PICKLIST,
    symbol: SmartsheetSymbol.STAR_RATING,
    options: z.enum(['Empty', 'One', 'Two', 'Three', 'Four', 'Five']),
  }),
  column5: defineColumn({
    columnName: 'Column 5 (Currency)',
    columnType: SmartsheetColumnType.TEXT_NUMBER,
    defaultFormat: {
      currency: SmartsheetCurrency.EUR,
      numberFormat: SmartsheetNumberFormat.CURRENCY,
    },
  }),
};

async function main() {
  const sampleSheet = await SmartsheetSDK.loadSheet({
    name: 'Sample',
    schema: SampleSheetSchema,
    createIfNotExist: true,
  });

  const createdRow = await sampleSheet.insertRow({
    column1: '123',
    column2: '456',
    column3: 'Option 3',
    column4: 'Three',
    column5: 123.45,
  });
  console.log('createdRow:', createdRow);

  const row = await sampleSheet.getRow(createdRow.id);

  row.column2 = 'Modified column 2';
  await row.update();
}

main();
