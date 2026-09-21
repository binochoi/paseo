/**
 * The launch arguments field is one line of text, typed the way a terminal
 * would take it. Storage keeps the split list, so the daemon never parses.
 *
 * Only quotes and backslashes are understood. No variables, globs, or pipes:
 * the daemon passes each item to the process as-is, without a shell.
 */
export function splitLaunchArgs(text: string): string[] {
  const args: string[] = [];
  let current = "";
  let hasCurrent = false;
  let quote: '"' | "'" | null = null;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (quote === "'") {
      if (char === "'") {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }
    if (char === "\\" && index + 1 < text.length) {
      index += 1;
      current += text[index];
      hasCurrent = true;
      continue;
    }
    if (quote === '"') {
      if (char === '"') {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      hasCurrent = true;
      continue;
    }
    if (/\s/.test(char)) {
      if (hasCurrent) {
        args.push(current);
        current = "";
        hasCurrent = false;
      }
      continue;
    }
    current += char;
    hasCurrent = true;
  }

  if (hasCurrent) {
    args.push(current);
  }
  return args;
}

/** The reverse of `splitLaunchArgs`, so a stored list reads back the same. */
export function joinLaunchArgs(args: readonly string[]): string {
  return args
    .map((arg) => (arg && /^[\w@%+=:,./-]+$/.test(arg) ? arg : `'${arg.replace(/'/g, `'\\''`)}'`))
    .join(" ");
}
