import { Command } from "commander";
import ConsoleApiHelper from "../utils/ConsoleApiHelper";
import { checkPrereqs } from "../utils/checkPrereqs";
import readline  from "readline/promises";
import writeResponse from "../utils/writeResponse";

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

const PATH_FRAG = 'dynamic_configs';

abstract class DynamicConfigHelpers {
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

  static async update(id: string, properties: string) {
    if (!checkPrereqs()) {
      return -1;
    }

    let body = {};
    try {
      body = JSON.parse(properties);
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

  static async delete(id: string, options: any) {
    if (!checkPrereqs()) {
      return -1;
    }

    if (!options.force) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await rl.question(
        `Are you sure you want to delete dynamic-config (id: ${id})? (y/n): `,
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