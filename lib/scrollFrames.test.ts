import { describe, it, expect } from "vitest";
import { nearestLoadedIndex, getTargetFrameIndex } from "./scrollFrames";

describe("nearestLoadedIndex", () => {
  it("returns the target index itself when it is loaded", () => {
    const loaded = [true, true, true];
    expect(nearestLoadedIndex(loaded, 1)).toBe(1);
  });

  it("returns the nearest loaded index below when target is not loaded", () => {
    const loaded = [true, false, false];
    expect(nearestLoadedIndex(loaded, 2)).toBe(0);
  });

  it("returns the nearest loaded index above when nothing below is loaded", () => {
    const loaded = [false, false, true];
    expect(nearestLoadedIndex(loaded, 0)).toBe(2);
  });

  it("prefers the closer of two equally-plausible directions", () => {
    // target=2, index 1 is 1 away, index 4 is 2 away — prefer 1
    const loaded = [false, true, false, false, true];
    expect(nearestLoadedIndex(loaded, 2)).toBe(1);
  });

  it("returns -1 when nothing is loaded", () => {
    const loaded = [false, false, false];
    expect(nearestLoadedIndex(loaded, 1)).toBe(-1);
  });
});

describe("getTargetFrameIndex", () => {
  it("returns frame 0 at the top of the page", () => {
    expect(getTargetFrameIndex(0, 1000, 249)).toBe(0);
  });

  it("returns the last frame at the bottom of the page", () => {
    expect(getTargetFrameIndex(1000, 1000, 249)).toBe(248);
  });

  it("clamps to 0 when maxScrollTop is 0 or negative (short page)", () => {
    expect(getTargetFrameIndex(0, 0, 249)).toBe(0);
    expect(getTargetFrameIndex(50, -10, 249)).toBe(0);
  });

  it("clamps to the last frame when scrollTop exceeds maxScrollTop", () => {
    expect(getTargetFrameIndex(2000, 1000, 249)).toBe(248);
  });

  it("maps a mid-scroll position to a proportional frame", () => {
    // 50% scrolled through a 249-frame sequence
    const result = getTargetFrameIndex(500, 1000, 249);
    expect(result).toBeGreaterThanOrEqual(123);
    expect(result).toBeLessThanOrEqual(125);
  });
});
