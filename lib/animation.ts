/** Ease-out-cubic: fast start, gentle finish. t and the return value are both in [0, 1]. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
