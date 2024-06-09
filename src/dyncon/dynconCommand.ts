import { Command } from "commander";
import { EntityHelpers } from "../utils/EntityHelpers";

export default function dynconCommand(program: Command) {
  const topCommand = program.command('dyncon')
    .description('create/list/edit dynamic configs');

  topCommand
    .command('create <dynamic-config-name>')
    .description('create a new dynamic config')
    .action(async (dynconName: string) => {
      DynamicConfigHelpers.create(dynconName);
    });
  topCommand
    .command('get <dynamic-config-id>')
    .description('retrieve dynamic config details')
    .action(async (id: string) => {
      DynamicConfigHelpers.get(id);
    });
  topCommand
    .command('list')
    .description('list all dynamic configs')
    .option('-p, --page <page-number>', 'page number (use this for pagination)')
    .action(async (options) => {
      await DynamicConfigHelpers.list(options);
    });
  topCommand
    .command('update <dynamic-config-id> <dynamic-config-properties-json>')
    .description('update a dynamic config')
    .action(async (id: string, dynconProps: string) => {
      DynamicConfigHelpers.update(id, dynconProps);
    });
  topCommand
    .command('delete <dynamic-config-id>')
    .option('-f, --force', 'do not prompt for confirmation')
    .description('delete a dynamic config')
    .action(async (id: string, options) => {
      DynamicConfigHelpers.delete(id, options);
    });
}

abstract class DynamicConfigHelpers extends EntityHelpers {
  protected static pathFrag = 'dynamic_configs';
  protected static entityType = 'dynamic config';
}