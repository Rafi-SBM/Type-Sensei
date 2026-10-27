/**
 * Deterministic 32-bit PRNG (mulberry32). The app seeds it from the clock, but
 * tests can pass a fixed seed to get a reproducible test text.
 */
export function createRandom(seed: number = Date.now()): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}
