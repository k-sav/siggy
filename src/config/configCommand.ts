import { Command } from "commander";
import { setNetRcKey } from "../utils/netrc";

export default function configCommand(program: Command) {
  program.command('config')
    .description('view/edit configuration settings')
    .option('-k, --key <console-secret-key>', 'set console key')
    .action((options) => {
      if (options.key) {
        ConfigHelpers.setKey(options.key);
      }
    });
}

abstract class ConfigHelpers {
  static setKey(key: string) {
    setNetRcKey('apikey', key);
    console.info('API key set');
  }
}