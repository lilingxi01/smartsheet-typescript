import axios from 'axios';
import { ServerEnvironment } from '@/smartsheet-sdk/utils/environment';

/**
 * The smartsheetFetcher is an axios instance that is configured to use the Smartsheet API token.
 */
export const smartsheetFetcher = axios.create({
  baseURL: 'https://api.smartsheet.com/2.0/',
  headers: {
    'Authorization': `Bearer ${ServerEnvironment.SMARTSHEET_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});
