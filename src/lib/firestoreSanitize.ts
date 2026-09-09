// Firestore rejects object fields whose value is undefined. Keep media URLs and
// every concrete value exactly as supplied while pruning only undefined fields
// before writes.
export const stripUndefined = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefined(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item !== undefined) result[key] = stripUndefined(item);
    }
    return result as T;
  }

  return value;
};
