import { Command } from "commander";
import { EntityHelpers } from "../utils/EntityHelpers";

export default function gatesCommand(program: Command) {
  const topCommand = program.command('gates')
    .description('create/list/edit gates');

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
    .option('-f, --force', 'do not prompt for confirmation')
    .description('delete a gate')
    .action(async (id: string, options) => {
      GateHelpers.delete(id, options);
    });
}

abstract class GateHelpers extends EntityHelpers {
  protected static pathFrag = 'gates';
  protected static entityType = 'gate';
}