import { getNetRcKey, setNetRcKey } from "../utils/netrc";

import { Command } from "commander";

export default function configCommand(program: Command) {
  program.command('config')
    .description('view/edit configuration settings')
    .option('-c, --consolekey <console-api-key>', 'set console key')
    .option('-k, --clientkey <client-api-key>', 'set client key')
    .action((options) => {
      if (Object.keys(options).length === 0) {
        let oneKeySet = false;
        if (getNetRcKey('consolekey')) {
          console.info('Console API key is present.');
          oneKeySet = true;
        }
        if (getNetRcKey('clientkey')) {
          console.info('Client API key is present.');
          oneKeySet = true;
        }
        if (!oneKeySet) {
          console.info('No keys set.');
        }
        return;
      }

      if (options.consolekey) {
        ConfigHelpers.setConsoleKey(options.consolekey);
      }
      if (options.clientkey) {
        ConfigHelpers.setClientKey(options.clientkey);
      }
    });
}

abstract class ConfigHelpers {
  static setConsoleKey(key: string) {
    setNetRcKey('consolekey', key);
    console.info('Console API key set');
  }

  static setClientKey(key: string) {
    setNetRcKey('clientkey', key);
    console.info('Client API key set');
  }
}