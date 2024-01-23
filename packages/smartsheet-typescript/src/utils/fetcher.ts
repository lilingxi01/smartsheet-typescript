import axios from 'axios';

/**
 * Creates a new instance of axios with the Smartsheet API base URL and the authorization header.
 */
export function getSmartsheetFetcher(accessToken: string) {
  return axios.create({
    baseURL: 'https://api.smartsheet.com/2.0/',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
}
