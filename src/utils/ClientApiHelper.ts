import { getNetRcKey } from "./netrc"

const BASE_URL = 'https://statsigapi.net/v1';

export default class ClientApiHelper {
  static apiKey = null;

  public static getKey() {
    if (!this.apiKey) {
      this.apiKey = getNetRcKey('clientkey');
    }
    return this.apiKey;
  }
 
  public static async post(path: string, body: Record<string, any>) {
    return this.issueRequest(
      'POST',
      `${BASE_URL}/${path}`,
      body,
    );
  }

  static async issueRequest(method: string, url: string, body: any) {
    const key = this.getKey();
    if (!key) {
      throw new Error('API key not set. Please run `statsig config -k <client-api-key>`.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'STATSIG-API-KEY': key,
    };
    const options = {
      method,
      headers,
    };
    if (body) {
      options['body'] = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    return response;
  }
}