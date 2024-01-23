import { prepareSmartsheetSDK } from 'smartsheet-typescript';

export const SmartsheetSDK = prepareSmartsheetSDK({
  accessToken: Bun.env.SMARTSHEET_API_TOKEN ?? '',
});
