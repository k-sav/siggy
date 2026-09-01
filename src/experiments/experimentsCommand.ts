import { checkClientApiPrereqs, checkConsoleApiPrereqs } from "../utils/checkPrereqs";

import ClientApiHelper from "../utils/ClientApiHelper";
import { Command } from "commander";
import ConsoleApiHelper from "../utils/ConsoleApiHelper";
import { EntityHelpers } from "../utils/EntityHelpers";
import writeResponse from "../utils/writeResponse";

export default function experimentsCommand(program: Command) {
  const topCommand = program.command('experiments')
    .description('create/list/edit/archive experiments');

  topCommand
    .command('create <experiment-name>')
    .description('create a new experiment')
    .action(async (name: string) => {
      ExperimentHelpers.create(name);
    });
  topCommand
    .command('get <experiment-id>')
    .description('retrieve experiment details')
    .action(async (id: string) => {
      ExperimentHelpers.get(id);
    });
  topCommand
    .command('list')
    .description('list all experiments')
    .option('-p, --page <page-number>', 'page number (use this for pagination)')
    .option('-s, --status <status>', 'filter by status (e.g. active, decision_made, experiment_stopped, abandoned, setup, archived)')
    .action(async (options) => {
      await ExperimentHelpers.list(options);
    });
  topCommand
    .command('update <experiment-id> <experiments-properties-json>')
    .description('update an experiment')
    .action(async (id: string, props: string) => {
      ExperimentHelpers.update(id, props);
    });
  topCommand
    .command('delete <experiment-id>')
    .option('-f, --force', 'do not prompt for confirmation')
    .description('delete an experiment')
    .action(async (id: string, options) => {
      ExperimentHelpers.delete(id, options);
    });
  topCommand
    .command('archive <experiment-id>')
    .description('archive an experiment')
    .action(async (id: string) => {
      ExperimentHelpers.archive(id);
    });
  topCommand
    .command('start <experiment-id>')
    .description('start an experiment')
    .action(async (id: string) => {
      ExperimentHelpers.start(id);
    });
  topCommand
    .command('reset <experiment-id>')
    .description('reset an experiment')
    .action(async (id: string) => {
      ExperimentHelpers.reset(id);
    });
  topCommand
    .command('abandon <experiment-id>')
    .description('abandon an experiment')
    .action(async (id: string) => {
      ExperimentHelpers.abandon(id);
    });
  topCommand
    .command('ship <experiment-id> <ship-properties-json>')
    .description('ship an experiment by launching a variant')
    .action(async (id: string, props: string) => {
      ExperimentHelpers.ship(id, props);
    });

  topCommand
    .command('get-value <experiment-id>')
    .description('retrieve the value of the experiment variant for a user')
    .option('-u, --user <user-object-json>', 'user object json')
    .action(async (id: string, options) => {
      ExperimentHelpers.getValue(id, options);
    });
}

abstract class ExperimentHelpers extends EntityHelpers {
  protected static pathFrag = 'experiments';
  protected static entityType = 'experiment';

  static async start(id: string) {
    if (!checkConsoleApiPrereqs()) {
      return -1;
    }

    const resp = await ConsoleApiHelper.put(`${this.pathFrag}/${id}/start`);
    return writeResponse(resp);
  }

  static async reset(id: string) {
    if (!checkConsoleApiPrereqs()) {
      return -1;
    }

    const resp = await ConsoleApiHelper.put(`${this.pathFrag}/${id}/reset`);
    return writeResponse(resp);
  }

  static async abandon(id: string) {
    if (!checkConsoleApiPrereqs()) {
      return -1;
    }

    const resp = await ConsoleApiHelper.put(`${this.pathFrag}/${id}/abandon`);
    return writeResponse(resp);
  }

  static async ship(id: string, props: string) {
    if (!checkConsoleApiPrereqs()) {
      return -1;
    }

    let body = {};
    try {
      body = JSON.parse(props);
    } catch {
      console.error('Invalid JSON');
      return -1;
    }

    const resp = await ConsoleApiHelper.put(
      `${this.pathFrag}/${id}/make_decision`,
      body,
    );
    return writeResponse(resp);
  }

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