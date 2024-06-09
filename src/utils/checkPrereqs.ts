import { getNetRcKey } from './netrc';

export function checkPrereqs(
  keyIsPresent: boolean = true,
): boolean {
  if (keyIsPresent) {
    const key = getNetRcKey('apikey');
    if (!key) {
      console.error('API key not set. Please run `statsig config -k <console-api-key>` to set your API key.');
      return false;
    }
  }

  return true;
}