export function setByPath(
  object: Record<string, string>,
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): void {
  const keys = path.split(".");
  const lastKey = keys.pop();
  if (!lastKey) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastObj = keys.reduce((acc: any, key) => {
    if (!(key in acc) || typeof acc[key] !== "object") {
      acc[key] = {};
    }
    return acc[key];
  }, object);

  lastObj[lastKey] = value;
}

export function getByPath(
  object: Record<string, string>,
  path: string,
): string | null {
  const keys = path.split(".");

  return keys.reduce((acc, curr) => {
    return acc?.[curr] || null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, object as any);
}

/**
 * Replace all English digits with their corresponding Arabic ones
 *
 * @param text the string with English numbers
 * @returns an Arabic-only numeric string
 */
export function enToArNumbersConvertor(text?: string) {
  return (
    text?.replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[parseInt(digit, 10)]) || text
  );
}

export function customJoin(...parts: string[]): string {
  return parts
    .filter(Boolean) // remove empty parts
    .map((part, index) => {
      // Remove leading slashes from all but the first part
      if (index > 0) {
        part = part.replace(/^\/+/, "");
      }
      // Remove trailing slashes from all but the last part
      if (index < parts.length - 1) {
        part = part.replace(/\/+$/, "");
      }
      return part;
    })
    .join("/")
    .replace(/\/{2,}/g, "/"); // collapse multiple slashes
}
