import { describe, expect, it } from "vitest";

import { toFieldErrors } from "@/lib/field_errors";

describe("toFieldErrors", () => {
  it("wraps each message in an object", () => {
    expect(toFieldErrors(["can't be blank", "is too short"])).toEqual([
      { message: "can't be blank" },
      { message: "is too short" },
    ]);
  });

  it("returns undefined when there are no messages", () => {
    expect(toFieldErrors(undefined)).toBeUndefined();
  });
});
