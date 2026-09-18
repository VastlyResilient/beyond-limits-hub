import { describe, it, expect } from "vitest";
import { applyOps, diffOps } from "../applyOps";

describe("applyOps", () => {
  it("does not mutate its input", () => {
    const before = { a: "1" };
    const after = applyOps(before, [{ kind: "setText", target: "a", value: "2" }]);
    expect(before.a).toBe("1");
    expect(after.a).toBe("2");
  });
  it("ignores nullish values", () => {
    expect(applyOps({}, [{ kind: "setText", target: "x", value: undefined as any }])).toEqual({});
  });
  it("records a diff", () => {
    const d = diffOps({ a: "1" }, [{ kind: "setText", target: "a", value: "2" }]);
    expect(d[0]).toEqual({ target: "a", from: "1", to: "2", kind: "setText" });
  });
  it("records null as the previous value when there was none", () => {
    expect(diffOps({}, [{ kind: "setText", target: "a", value: "2" }])[0].from).toBeNull();
  });
});

describe("diffOps with a resolver", () => {
  it("reports the on-screen value when there was no override yet", () => {
    const d = diffOps({}, [{ kind: "setText", target: "a", value: "Today" }], () => "Command Center");
    expect(d[0].from).toBe("Command Center");
  });
  it("still prefers a real previous override", () => {
    const d = diffOps({ a: "Yesterday" }, [{ kind: "setText", target: "a", value: "Today" }], () => "Command Center");
    expect(d[0].from).toBe("Yesterday");
  });
});
