/**
 * Map a horizontal position within the plot area to the nearest data-point
 * index. Points are evenly spaced from x=0 (index 0) to x=chartW (index n-1).
 * Positions outside the plot clamp to the first/last point.
 */
export function nearestIndexFromX(localX: number, n: number, chartW: number): number {
  if (n <= 1) return 0;
  const ratio = localX / chartW;
  const idx = Math.round(ratio * (n - 1));
  return Math.max(0, Math.min(n - 1, idx));
}
