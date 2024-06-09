import { getNetRcKey } from './netrc';

export function checkConsoleApiPrereqs(): boolean {
  const key = getNetRcKey('consolekey');
  if (!key) {
    console.error('Console key not set. Please run `statsig config -k <console-api-key>` to set your console API key.');
    return false;
  }

  return true;
}

export function checkClientApiPrereqs(): boolean {
  const key = getNetRcKey('clientkey');
  if (!key) {
    console.error('Client key not set. Please run `statsig config -c <client-api-key>` to set your client API key.');
    return false;
  }
  
  return true;
}