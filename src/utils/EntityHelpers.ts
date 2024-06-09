import ConsoleApiHelper from "./ConsoleApiHelper";
import { checkPrereqs } from "./checkPrereqs";
import readline from 'readline/promises';
import writeResponse from "./writeResponse";

export abstract class EntityHelpers {
  protected static pathFrag: string = 'not-set';
  protected static entityType: string = 'not-set';
  static async create(name: string) {
    if (!checkPrereqs()) {
      return -1;
    }

    const resp = await ConsoleApiHelper.post(
      this.pathFrag,
      { name }
    );
    return writeResponse(resp);
  }

  static async get(id: string) {
    if (!checkPrereqs()) {
      return -1;
    }

    const resp = await ConsoleApiHelper.get(`${this.pathFrag}/${id}`, {});
    return writeResponse(resp);
  }

  static async list(options: any) {
    if (!checkPrereqs()) {
      return -1;
    }

    let page = options.page || 1;
    let limit = 100;
    const resp = await ConsoleApiHelper.get(this.pathFrag, { page, limit });
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
      `${this.pathFrag}/${id}`,
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
        `Are you sure you want to delete ${this.entityType} (id: ${id})? (y/n): `,
      );
      rl.close();
      if (answer !== 'y') {
        console.log('Aborted');
        return 0;
      }
    }

    const resp = await ConsoleApiHelper.delete(`${this.pathFrag}/${id}`);
    return writeResponse(resp);
  }
}