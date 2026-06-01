import { describe, expect, it } from "vitest";
import { parseOptionalBoolean } from "./form";

describe("parseOptionalBoolean", () => {
  it("parses the string false as boolean false", () => {
    expect(parseOptionalBoolean("false")).toBe(false);
  });

  it("keeps an omitted value undefined", () => {
    expect(parseOptionalBoolean(undefined)).toBeUndefined();
  });
});
