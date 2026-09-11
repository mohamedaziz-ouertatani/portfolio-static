import { describe, it, expect } from "vitest";
import { easeOutCubic } from "./animation";

describe("easeOutCubic", () => {
  it("returns 0 at t=0", () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it("is greater than the linear value partway through (ease-out shape)", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it("is monotonically increasing", () => {
    const a = easeOutCubic(0.2);
    const b = easeOutCubic(0.5);
    const c = easeOutCubic(0.8);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });
});
