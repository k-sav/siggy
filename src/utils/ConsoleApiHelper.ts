import { getNetRcKey } from "./netrc"

const BASE_URL = 'https://statsigapi.net/console/v1';

export default class ConsoleApiHelper {
  static apiKey = null;

  public static getKey() {
    if (!this.apiKey) {
      this.apiKey = getNetRcKey('consolekey');
    }
    return this.apiKey;
  }
 
  public static async get(path: string, params: Record<string, any> = {}) {
    return this.issueRequest(
      'GET',
      this.constructUrl(path, params),
      null,
    );
  }

  public static async post(path: string, body: Record<string, any>) {
    return this.issueRequest(
      'POST',
      `${BASE_URL}/${path}`,
      body,
    );
  }

  public static async patch(path: string, body: Record<string, any>) {
    return this.issueRequest(
      'PATCH',
      `${BASE_URL}/${path}`,
      body,
    );
  }

  public static async put(path: string, body: Record<string, any> = {}) {
    return this.issueRequest(
      'PUT',
      `${BASE_URL}/${path}`,
      body,
    );
  }

  public static async delete(path: string) {
    return this.issueRequest(
      'DELETE',
      `${BASE_URL}/${path}`,
      null,
    );
  }

  static constructUrl(path: string, params: Record<string, any>) {
    const url = new URL(`${BASE_URL}/${path}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return url.toString();
  }

  static async issueRequest(method: string, url: string, body: any) {
    const key = this.getKey();
    if (!key) {
      throw new Error(
        'API key not set. Run `siggy config -c <console-api-key>` or set SIGGY_CONSOLE_API_KEY.',
      );
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