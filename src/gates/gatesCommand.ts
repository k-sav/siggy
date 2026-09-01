import ClientApiHelper from "../utils/ClientApiHelper";
import { Command } from "commander";
import ConsoleApiHelper from "../utils/ConsoleApiHelper";
import { EntityHelpers } from "../utils/EntityHelpers";
import { checkClientApiPrereqs, checkConsoleApiPrereqs } from "../utils/checkPrereqs";
import writeResponse from "../utils/writeResponse";

export default function gatesCommand(program: Command) {
  const topCommand = program.command('gates')
    .description('create/list/edit/archive gates');

  topCommand
    .command('create <gate-name>')
    .description('create a new feature gate')
    .action(async (gateName: string) => {
      GateHelpers.create(gateName);
    });
  topCommand
    .command('get <gate-id>')
    .description('retrieve gate details')
    .action(async (id: string) => {
      GateHelpers.get(id);
    });
  topCommand
    .command('list')
    .description('list all gates')
    .option('-p, --page <page-number>', 'page number (use this for pagination)')
    .option('-s, --status <status>', 'filter by status (e.g. In Progress, Launched, Disabled, Archived)')
    .action(async (options) => {
      await GateHelpers.list(options);
    });
  topCommand
    .command('update <gate-id> <gate-properties-json>')
    .description('update a gate')
    .action(async (id: string, gateProperties: string) => {
      GateHelpers.update(id, gateProperties);
    });
  topCommand
    .command('delete <gate-id>')
    .description('delete a gate')
    .option('-f, --force', 'do not prompt for confirmation')
    .action(async (id: string, options) => {
      GateHelpers.delete(id, options);
    });
  topCommand
    .command('archive <gate-id>')
    .description('archive a gate')
    .action(async (id: string) => {
      GateHelpers.archive(id);
    });
  topCommand
    .command('cleanup <gate-id>')
    .description('start a code cleanup (generates a removal PR via the connected repo integration)')
    .action(async (id: string) => {
      GateHelpers.cleanup(id);
    });

  topCommand
    .command('check <gate-id>')
    .description('check if the current state of the gate for a user')
    .option('-u, --user <user-object-json>', 'user object json')
    .action(async (id: string, options) => {
      GateHelpers.check(id, options);
    });
}

abstract class GateHelpers extends EntityHelpers {
  protected static pathFrag = 'gates';
  protected static entityType = 'gate';

  static async cleanup(id: string) {
    if (!checkConsoleApiPrereqs()) {
      return -1;
    }

    const resp = await ConsoleApiHelper.post(`${this.pathFrag}/${id}/code_cleanup`, {});
    return writeResponse(resp);
  }

  public static async check(id: string, options: any) {
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

    const resp = await ClientApiHelper.post(`check_gate`, {
      user,
      gateName: id,
    });
    return writeResponse(resp);
  }
}