import { Command } from "commander";
import fs from "fs";

import ConsoleApiHelper from "../utils/ConsoleApiHelper";
import { checkConsoleApiPrereqs } from "../utils/checkPrereqs";

type OutputFormat = "jsonl" | "json" | "table";

type LogEntry = {
  id: string;
  timestamp: string;
  event_name: string | null;
  user_id: string | null;
  value: string | null;
  sdk_type: string | null;
  sdk_version: string | null;
};

type Pagination = {
  next_cursor: string | null;
  has_more: boolean;
};

type LogsListResponseBody = {
  message?: string;
  data: {
    data: LogEntry[];
    pagination: Pagination;
  };
};

type ListOptions = {
  query?: string;
  queryFile?: string;
  eventName?: string;
  startTs?: string;
  endTs?: string;
  limit?: string;
  after?: string;
  format?: string;
  paginate?: boolean;
  max?: string;
};

function registerListCommand(parent: Command, name: string, description: string) {
  parent
    .command(name)
    .description(description)
    .option(
      "-q, --query <text>",
      "Logs Explorer filter (inner syntax or full #events{...}); see docs.statsig.com/infra-analytics/logs-explorer-queries",
    )
    .option(
      "--query-file <path>",
      "read Logs Explorer filter from a file (mutually exclusive with --query)",
    )
    .option("-e, --event-name <name>", "filter by event name (shorthand for a single event)")
    .option("--start-ts <ms>", "start of the time window (ms since epoch)")
    .option("--end-ts <ms>", "end of the time window (ms since epoch)")
    .option("-l, --limit <n>", "page size (max 1000, default 100)")
    .option("-a, --after <cursor>", "opaque pagination cursor")
    .option(
      "-f, --format <format>",
      "output format: jsonl (default), json, table",
      "jsonl",
    )
    .option("--paginate", "auto-walk cursors until `has_more` is false")
    .option("--max <n>", "with --paginate, stop after this many events total")
    .action(async (options: ListOptions) => {
      const code = await listLogs(options);
      if (code !== 0) {
        process.exitCode = code === -1 ? 1 : code;
      }
    });
}

export default function logsCommand(program: Command) {
  const topCommand = program
    .command("logs")
    .description("fetch events from the Logs Explorer feed (Console API GET /logs)");

  registerListCommand(
    topCommand,
    "list",
    "list events for the configured company",
  );
  registerListCommand(
    topCommand,
    "fetch",
    "alias for list — fetch events from the Logs Explorer feed",
  );
}

async function listLogs(options: ListOptions): Promise<number> {
  if (!checkConsoleApiPrereqs()) {
    return -1;
  }

  const format = parseFormat(options.format);
  if (format == null) {
    console.error(
      `Invalid --format value '${options.format}'. Expected one of: jsonl, json, table.`,
    );
    return -1;
  }

  const max = options.max ? Number(options.max) : undefined;
  if (max != null && (!Number.isFinite(max) || max <= 0)) {
    console.error(`Invalid --max value '${options.max}'. Expected a positive integer.`);
    return -1;
  }

  const queryText = resolveQueryText(options);
  if (queryText instanceof Error) {
    console.error(queryText.message);
    return -1;
  }

  const baseParams: Record<string, string | number> = {};
  if (queryText != null) baseParams.query = queryText;
  if (options.eventName != null) baseParams.event_name = options.eventName;
  if (options.startTs != null) baseParams.start_ts = options.startTs;
  if (options.endTs != null) baseParams.end_ts = options.endTs;
  if (options.limit != null) baseParams.limit = options.limit;

  let cursor: string | null = options.after ?? null;
  const collected: LogEntry[] = [];
  let pages = 0;

  while (true) {
    const params: Record<string, string | number> = { ...baseParams };
    if (cursor != null) params.after = cursor;

    const resp = await ConsoleApiHelper.get("logs", params);
    if (!resp.ok) {
      await writeErrorBody(resp);
      return -1;
    }

    const body = (await resp.json()) as LogsListResponseBody;
    const events = body.data?.data ?? [];
    const pagination = body.data?.pagination;
    pages += 1;

    if (options.paginate) {
      for (const event of events) {
        collected.push(event);
        if (max != null && collected.length >= max) break;
      }
      if (max != null && collected.length >= max) break;
      if (!pagination?.has_more || pagination.next_cursor == null) break;
      cursor = pagination.next_cursor;
      continue;
    }

    // Single-page mode: stream directly and exit.
    writeEvents(events, format);
    if (format === "table" || format === "json") {
      writePaginationHint(pagination);
    }
    return 0;
  }

  // Paginated walk: emit all collected events at once.
  writeEvents(collected, format);
  if (format === "table" || format === "json") {
    console.error(`# walked ${pages} page(s), ${collected.length} event(s)`);
  }
  return 0;
}

function parseFormat(raw: string | undefined): OutputFormat | null {
  const value = raw ?? "jsonl";
  if (value === "jsonl" || value === "json" || value === "table") {
    return value;
  }
  return null;
}

function writeEvents(events: LogEntry[], format: OutputFormat) {
  if (format === "jsonl") {
    for (const event of events) {
      process.stdout.write(JSON.stringify(event) + "\n");
    }
    return;
  }
  if (format === "json") {
    console.log(JSON.stringify(events, null, 2));
    return;
  }
  writeTable(events);
}

function writeTable(events: LogEntry[]) {
  if (events.length === 0) {
    console.log("(no events)");
    return;
  }
  const cols = ["timestamp", "event_name", "user_id", "value"] as const;
  const widths: Record<string, number> = Object.fromEntries(
    cols.map((c) => [c, c.length]),
  );
  for (const event of events) {
    for (const col of cols) {
      const cell = String(event[col] ?? "");
      if (cell.length > widths[col]) widths[col] = Math.min(cell.length, 60);
    }
  }
  const header = cols
    .map((c) => c.toUpperCase().padEnd(widths[c]))
    .join("  ");
  console.log(header);
  console.log(cols.map((c) => "-".repeat(widths[c])).join("  "));
  for (const event of events) {
    const row = cols
      .map((c) => truncate(String(event[c] ?? ""), widths[c]).padEnd(widths[c]))
      .join("  ");
    console.log(row);
  }
}

function truncate(value: string, width: number): string {
  if (value.length <= width) return value;
  return value.slice(0, Math.max(0, width - 1)) + "…";
}

function writePaginationHint(pagination: Pagination | undefined) {
  if (pagination?.has_more && pagination.next_cursor != null) {
    console.error(
      `# more events available — pass --after ${pagination.next_cursor} to continue, or --paginate to walk all pages`,
    );
  }
}

function resolveQueryText(options: ListOptions): string | null | Error {
  if (options.query != null && options.queryFile != null) {
    return new Error("Provide either --query or --query-file, not both.");
  }
  if (options.query != null && options.eventName != null) {
    return new Error("Provide either --query or --event-name, not both.");
  }
  if (options.queryFile != null && options.eventName != null) {
    return new Error("Provide either --query-file or --event-name, not both.");
  }

  if (options.queryFile != null) {
    try {
      return fs.readFileSync(options.queryFile, "utf8").trim();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return new Error(`Failed to read --query-file: ${message}`);
    }
  }

  if (options.query != null) {
    return options.query;
  }

  return null;
}

async function writeErrorBody(response: Response): Promise<void> {
  const text = await response.text();
  try {
    const errObj = JSON.parse(text);
    if (errObj.error) {
      console.error(errObj.error);
    } else if (errObj.message) {
      console.error(errObj.message);
      if (errObj.errors) {
        console.error(errObj.errors);
      }
    } else {
      console.error(text);
    }
  } catch {
    console.error(text);
  }
}
