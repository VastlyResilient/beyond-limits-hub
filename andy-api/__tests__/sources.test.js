import { describe, it, expect } from "vitest";
import { annotationSources } from "../openrouter.js";

describe("annotationSources", () => {
  it("keeps a real title", () => {
    const s = annotationSources([{ url_citation: { title: "Bobcat Sighting", url: "https://patch.com/x" } }]);
    expect(s[0].title).toBe("Bobcat Sighting");
  });
  it("replaces a junk title with the domain", () => {
    const s = annotationSources([{ url_citation: { title: "TITLE", url: "https://www.irs.gov/forms-pubs/prior-year" } }]);
    expect(s[0].title).toBe("irs.gov");
  });
  it("handles a missing title", () => {
    const s = annotationSources([{ url_citation: { url: "https://www.stamfordadvocate.com/a" } }]);
    expect(s[0].title).toBe("stamfordadvocate.com");
  });
  it("ignores malformed annotations", () => {
    expect(annotationSources([{}, null, { url_citation: null }])).toEqual([]);
  });
});
