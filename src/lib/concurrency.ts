import "server-only";

// Runs `fn` over `items` with at most `limit` calls in flight at once.
// Used for bulk DB operations (e.g. lead import) where doing one row at a
// time sequentially would multiply per-row network latency by thousands of
// rows and risk exceeding a serverless function's execution timeout.
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
