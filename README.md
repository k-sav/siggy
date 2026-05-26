# siggy

Statsig CLI for the [Console API](https://docs.statsig.com/console-api/introduction) and a subset of the Client API.

## Setup

```bash
pnpm install && pnpm run build
siggy config -c <console-api-key>   # stored in ~/.netrc (machine statsig.com)
```

Link locally: `pnpm link --global` (or `npm link` from the repo root).

## Logs Explorer

`siggy logs` calls `GET https://statsigapi.net/console/v1/logs` — the same feed as Logs Explorer in the console.

```bash
# Latest page (jsonl to stdout)
siggy logs list

# Same as list
siggy logs fetch

# Logs Explorer query (same syntax as Events mode in the console)
siggy logs fetch -q 'event_name:signup_completed AND #plan:enterprise'

# Query from a file (useful for long filters)
siggy logs fetch --query-file ./query.txt

# Shorthand: single event name
siggy logs fetch -e my_event --start-ts 1714000000000 --end-ts 1714086400000

# Table output, larger page
siggy logs list -f table -l 50

# Walk all pages (cap total events)
siggy logs list --paginate --max 500 -f json

# Continue from a cursor printed in the pagination hint
siggy logs list --after '<cursor>'
```

Output formats: `jsonl` (default, one event per line), `json` (array), `table`.
