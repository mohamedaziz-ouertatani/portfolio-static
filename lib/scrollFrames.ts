/**
 * Finds the loaded frame index closest to targetIndex, searching outward
 * in both directions. Returns -1 if no frame is loaded yet.
 */
export function nearestLoadedIndex(
  loaded: boolean[],
  targetIndex: number,
): number {
  if (loaded[targetIndex]) return targetIndex;

  const frameCount = loaded.length;
  for (let offset = 1; offset < frameCount; offset++) {
    const below = targetIndex - offset;
    if (below >= 0 && loaded[below]) return below;
    const above = targetIndex + offset;
    if (above < frameCount && loaded[above]) return above;
  }
  return -1;
}

/**
 * Maps the current scroll position to a frame index in [0, frameCount - 1].
 */
export function getTargetFrameIndex(
  scrollTop: number,
  maxScrollTop: number,
  frameCount: number,
): number {
  let scrollFraction = scrollTop / maxScrollTop;
  if (!isFinite(scrollFraction) || scrollFraction < 0) scrollFraction = 0;
  if (scrollFraction > 1) scrollFraction = 1;

  return Math.min(frameCount - 1, Math.ceil(scrollFraction * frameCount));
}
