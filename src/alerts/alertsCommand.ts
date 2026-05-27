import { Command } from 'commander';

import ConsoleApiHelper from '../utils/ConsoleApiHelper';
import { checkConsoleApiPrereqs } from '../utils/checkPrereqs';
import { EntityHelpers } from '../utils/EntityHelpers';
import { readJsonBody } from '../utils/readJsonBody';
import writeResponse from '../utils/writeResponse';

type JsonBodyOptions = {
  file?: string;
};

export default function alertsCommand(program: Command) {
  const topCommand = program
    .command('alerts')
    .description('create/list/edit topline alerts (Console API /alerts)');

  topCommand
    .command('create [alert-properties-json]')
    .description('create a new topline alert')
    .option('--file <path>', 'read alert properties from a JSON file')
    .action(async (properties: string | undefined, options: JsonBodyOptions) => {
      const code = await AlertHelpers.createFromInput(properties, options.file);
      if (code !== 0) {
        process.exitCode = code === -1 ? 1 : code;
      }
    });

  topCommand
    .command('get <alert-id>')
    .description('retrieve alert details')
    .action(async (id: string) => {
      const code = await AlertHelpers.get(id);
      if (code !== 0) {
        process.exitCode = code === -1 ? 1 : code;
      }
    });

  topCommand
    .command('list')
    .description('list all alerts')
    .option('-p, --page <page-number>', 'page number (use this for pagination)')
    .option('-l, --limit <limit>', 'page size')
    .action(async (options) => {
      const code = await AlertHelpers.list(options);
      if (code !== 0) {
        process.exitCode = code === -1 ? 1 : code;
      }
    });

  topCommand
    .command('update <alert-id> [alert-properties-json]')
    .description('update an alert (partial PATCH body)')
    .option('--file <path>', 'read alert properties from a JSON file')
    .action(async (id: string, properties: string | undefined, options: JsonBodyOptions) => {
      const code = await AlertHelpers.updateFromInput(id, properties, options.file);
      if (code !== 0) {
        process.exitCode = code === -1 ? 1 : code;
      }
    });

  topCommand
    .command('delete <alert-id>')
    .description('delete an alert')
    .option('-f, --force', 'do not prompt for confirmation')
    .action(async (id: string, options) => {
      const code = await AlertHelpers.delete(id, options);
      if (code !== 0) {
        process.exitCode = code === -1 ? 1 : code;
      }
    });

  const eventsCommand = topCommand
    .command('events')
    .description('list or read alert firing events');

  eventsCommand
    .command('list <alert-id>')
    .description('list events for an alert')
    .option('-p, --page <page-number>', 'page number')
    .option('-l, --limit <limit>', 'page size')
    .action(async (alertId: string, options) => {
      const code = await AlertHelpers.listEvents(alertId, options);
      if (code !== 0) {
        process.exitCode = code === -1 ? 1 : code;
      }
    });

  eventsCommand
    .command('get <alert-id> <event-id>')
    .description('retrieve a single alert event')
    .action(async (alertId: string, eventId: string) => {
      const code = await AlertHelpers.getEvent(alertId, eventId);
      if (code !== 0) {
        process.exitCode = code === -1 ? 1 : code;
      }
    });
}

abstract class AlertHelpers extends EntityHelpers {
  protected static pathFrag = 'alerts';
  protected static entityType = 'alert';

  static async createFromInput(
    properties: string | undefined,
    filePath: string | undefined,
  ) {
    if (!checkConsoleApiPrereqs()) {
      return -1;
    }
    const body = readJsonBody(properties, filePath);
    if (!body) {
      return -1;
    }

    const resp = await ConsoleApiHelper.post(this.pathFrag, body);
    return writeResponse(resp);
  }

  static async updateFromInput(
    id: string,
    properties: string | undefined,
    filePath: string | undefined,
  ) {
    if (!checkConsoleApiPrereqs()) {
      return -1;
    }
    const body = readJsonBody(properties, filePath);
    if (!body) {
      return -1;
    }

    const resp = await ConsoleApiHelper.patch(`${this.pathFrag}/${id}`, body);
    return writeResponse(resp);
  }

  static async list(options: { page?: string; limit?: string }) {
    if (!checkConsoleApiPrereqs()) {
      return -1;
    }

    const page = options.page || 1;
    const limit = options.limit || 100;
    const resp = await ConsoleApiHelper.get(this.pathFrag, { page, limit });
    if (!resp.ok) {
      return writeResponse(resp);
    }

    const respObj = await resp.json();
    let output = respObj;
    if (Array.isArray(respObj.data)) {
      output = respObj.data.map((item: Record<string, unknown>) => ({
        id: item.id,
        name: item.name,
        alertType: item.alertType,
        priority: item.priority,
      }));
    }
    console.log(JSON.stringify(output, null, 2));
    return 0;
  }

  static async listEvents(
    alertId: string,
    options: { page?: string; limit?: string },
  ) {
    if (!checkConsoleApiPrereqs()) {
      return -1;
    }

    const page = options.page || 1;
    const limit = options.limit || 100;
    const resp = await ConsoleApiHelper.get(
      `${this.pathFrag}/${alertId}/events`,
      { page, limit },
    );
    return writeResponse(resp);
  }

  static async getEvent(alertId: string, eventId: string) {
    if (!checkConsoleApiPrereqs()) {
      return -1;
    }

    const resp = await ConsoleApiHelper.get(
      `${this.pathFrag}/${alertId}/events/${eventId}`,
      {},
    );
    return writeResponse(resp);
  }
}
