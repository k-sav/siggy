import ClientApiHelper from "../utils/ClientApiHelper";
import { Command } from "commander";
import { EntityHelpers } from "../utils/EntityHelpers";
import { checkClientApiPrereqs } from "../utils/checkPrereqs";
import writeResponse from "../utils/writeResponse";

export default function dynconCommand(program: Command) {
  const topCommand = program.command('dyncon')
    .description('create/list/edit/archive dynamic configs');

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
    .option('-s, --status <status>', 'filter by status (e.g. Enabled, Disabled, Archived)')
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
  topCommand
    .command('archive <dynamic-config-id>')
    .description('archive a dynamic config')
    .action(async (id: string) => {
      DynamicConfigHelpers.archive(id);
    });

  topCommand
    .command('get-value <dynamic-config-id>')
    .description('retrieve the value of a dynamic config')
    .option('-u, --user <user-object-json>', 'user object json')
    .action(async (id: string, options) => {
      DynamicConfigHelpers.getValue(id, options);
    });
}

abstract class DynamicConfigHelpers extends EntityHelpers {
  protected static pathFrag = 'dynamic_configs';
  protected static entityType = 'dynamic config';

  public static async getValue(id: string, options: any) {
    if (!checkClientApiPrereqs()) {
      return -1;
    }

    let user = {};
    try {
      user = JSON.parse(options.user || '{}');
    } catch {
      console.error('Invalid JSON');
      return -1;
    }

    const resp = await ClientApiHelper.post(`get_config`, {
      user,
      configName: id,
    });
    return writeResponse(resp);
  }
}