import fs from 'fs';

export function readJsonBody(
  jsonArg: string | undefined,
  filePath: string | undefined,
): Record<string, unknown> | null {
  if (filePath && jsonArg) {
    console.error('Pass either a JSON argument or --file, not both.');
    return null;
  }
  if (filePath) {
    try {
      const parsed = parseJsonObject(fs.readFileSync(filePath, 'utf-8'));
      return parsed;
    } catch {
      console.error(`Failed to read or parse JSON from ${filePath}`);
      return null;
    }
  }
  if (!jsonArg) {
    console.error('Provide properties as JSON or use --file <path>.');
    return null;
  }
  try {
    return parseJsonObject(jsonArg);
  } catch {
    console.error('Invalid JSON');
    return null;
  }
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const parsed: unknown = JSON.parse(raw);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    console.error('JSON body must be an object');
    return null;
  }
  return parsed as Record<string, unknown>;
}
