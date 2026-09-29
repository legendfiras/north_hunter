/** Missing means null, undefined, or a string that is empty after trimming. Numeric zero is kept. */
export function presentValue(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

export function hasText(value: unknown): value is string {
  return presentValue(value) !== null && typeof value === "string";
}
