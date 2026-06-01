import { describe, expect, it } from "vitest";
import { calculateInclusiveDays } from "./date";

describe("calculateInclusiveDays", () => {
  it("counts a same-day leave as one day", () => {
    expect(calculateInclusiveDays("2026-06-01", "2026-06-01")).toBe(1);
  });

  it("returns zero for an invalid reversed range", () => {
    expect(calculateInclusiveDays("2026-06-10", "2026-06-01")).toBe(0);
  });
});
