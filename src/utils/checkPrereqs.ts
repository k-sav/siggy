import { getNetRcKey } from './netrc';

export function checkConsoleApiPrereqs(): boolean {
  const key = getNetRcKey('consolekey');
  if (!key) {
    console.error(
      'Console key not set. Run `siggy config -c <console-api-key>` or set SIGGY_CONSOLE_API_KEY / STATSIG_CONSOLE_API_KEY.',
    );
    return false;
  }

  return true;
}

export function checkClientApiPrereqs(): boolean {
  const key = getNetRcKey('clientkey');
  if (!key) {
    console.error(
      'Client key not set. Run `siggy config -k <client-api-key>` or set SIGGY_CLIENT_API_KEY.',
    );
    return false;
  }
  
  return true;
}