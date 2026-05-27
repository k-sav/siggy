#! /usr/bin/env node

import { Command } from "commander";
import configCommand from "./config/configCommand";
import dynconCommand from "./dyncon/dynconCommand";
import experimentsCommand from "./experiments/experimentsCommand";
import alertsCommand from "./alerts/alertsCommand";
import gatesCommand from "./gates/gatesCommand";
import segmentsCommand from "./segments/segmentsCommand";

function main() {
  const program = new Command();

  program
    .name('siggy')
    .description(`Statsig CLI
For information on schema, see https://docs.statsig.com/console-api/introduction
`)
    .version(process.env?.npm_package_version || '0.0.0.0');

  configCommand(program);
  alertsCommand(program);
  gatesCommand(program);
  dynconCommand(program);
  segmentsCommand(program);
  experimentsCommand(program);
  program.parse();
}

main();