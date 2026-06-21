import { describe, test, expect } from "vitest";
import { nearestIndexFromX } from "./chartGeometry";

describe("nearestIndexFromX", () => {
  // 11 points spread across a 100px-wide plot => one point every 10px
  const n = 11;
  const chartW = 100;

  test("returns 0 at the left edge", () => {
    expect(nearestIndexFromX(0, n, chartW)).toBe(0);
  });

  test("returns the last index at the right edge", () => {
    expect(nearestIndexFromX(100, n, chartW)).toBe(10);
  });

  test("snaps to the nearest point", () => {
    expect(nearestIndexFromX(23, n, chartW)).toBe(2);
    expect(nearestIndexFromX(27, n, chartW)).toBe(3);
  });

  test("clamps positions left of the plot to 0", () => {
    expect(nearestIndexFromX(-40, n, chartW)).toBe(0);
  });

  test("clamps positions right of the plot to the last index", () => {
    expect(nearestIndexFromX(150, n, chartW)).toBe(10);
  });

  test("always returns 0 for a single-point series", () => {
    expect(nearestIndexFromX(80, 1, chartW)).toBe(0);
  });
});
