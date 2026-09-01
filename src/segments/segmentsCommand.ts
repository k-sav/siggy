import { Command } from "commander";
import { EntityHelpers } from "../utils/EntityHelpers";

export default function segmentsCommand(program: Command) {
  const topCommand = program.command('segments')
    .description('create/list/edit segments');

  topCommand
    .command('create <segments-name>')
    .description('create a new segment')
    .action(async (name: string) => {
      SegmentHelpers.create(name);
    });
  topCommand
    .command('get <segments-id>')
    .description('retrieve segment details')
    .action(async (id: string) => {
      SegmentHelpers.get(id);
    });
  topCommand
    .command('list')
    .description('list all segments')
    .option('-p, --page <page-number>', 'page number (use this for pagination)')
    .option('-s, --status <status>', 'filter by status')
    .action(async (options) => {
      await SegmentHelpers.list(options);
    });
  topCommand
    .command('update <segments-id> <segments-properties-json>')
    .description('update a segment')
    .action(async (id: string, props: string) => {
      SegmentHelpers.update(id, props);
    });
  topCommand
    .command('delete <segments-id>')
    .option('-f, --force', 'do not prompt for confirmation')
    .description('delete a segment')
    .action(async (id: string, options) => {
      SegmentHelpers.delete(id, options);
    });
}

abstract class SegmentHelpers extends EntityHelpers {
  protected static pathFrag = 'segments';
  protected static entityType = 'segment';
}