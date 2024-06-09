import { Command } from "commander";
import ConsoleApiHelper from "../utils/ConsoleApiHelper";
import { checkPrereqs } from "../utils/checkPrereqs";
import readline  from "readline/promises";
import writeResponse from "../utils/writeResponse";

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

const PATH_FRAG = 'gates';

abstract class GateHelpers {
  static async create(name: string) {
    if (!checkPrereqs()) {
      return -1;
    }

    const resp = await ConsoleApiHelper.post(
      PATH_FRAG,
      { name }
    );
    return writeResponse(resp);
  }

  static async get(id: string) {
    if (!checkPrereqs()) {
      return -1;
    }

    const resp = await ConsoleApiHelper.get(`${PATH_FRAG}/${id}`, {});
    return writeResponse(resp);
  }

  static async list(options: any) {
    if (!checkPrereqs()) {
      return -1;
    }

    let page = options.page || 1;
    let limit = 100;
    const resp = await ConsoleApiHelper.get(PATH_FRAG, { page, limit });
    if (!resp.ok) {
      return writeResponse(resp);
    }

    const respObj = await resp.json();
    let output = respObj;
    if (respObj.data) {
      output = respObj.data.map((item: any) => {
        return {
          id: item.id,
          name: item.name,
          lastModifiedTime: item.lastModifiedTime,
          lastModifierName: item.lastModifierName,
        };
      });
    }
    console.log(output);
    return 0;
  }

  static async update(id: string, gateProperties: string) {
    if (!checkPrereqs()) {
      return -1;
    }

    let body = {};
    try {
      body = JSON.parse(gateProperties);
    } catch {
      console.error('Invalid JSON');
      return -1;
    }

    const resp = await ConsoleApiHelper.patch(
      `${PATH_FRAG}/${id}`,
      body,
    );
    return writeResponse(resp);
  }

  static async delete(id: string, options) {
    if (!checkPrereqs()) {
      return -1;
    }

    if (!options.force) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await rl.question(
        `Are you sure you want to delete gate (id: ${id})? (y/n): `,
      );
      rl.close();
      if (answer !== 'y') {
        console.log('Aborted');
        return 0;
      }
    }

    const resp = await ConsoleApiHelper.delete(`${PATH_FRAG}/${id}`);
    return writeResponse(resp);
  }
}