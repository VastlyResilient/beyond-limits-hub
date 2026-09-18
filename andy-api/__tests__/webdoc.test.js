import { describe, it, expect } from "vitest";
import { isAllowedUrl, htmlToText } from "../webdoc.js";

describe("webdoc", () => {
  it("blocks non-http schemes", () => {
    expect(isAllowedUrl("file:///etc/passwd", [])).toBe(false);
    expect(isAllowedUrl("javascript:alert(1)", [])).toBe(false);
  });
  it("blocks private and loopback targets (SSRF)", () => {
    expect(isAllowedUrl("http://127.0.0.1:8080/health", [])).toBe(false);
    expect(isAllowedUrl("http://169.254.169.254/latest/meta-data", [])).toBe(false);
    expect(isAllowedUrl("http://10.0.0.5/", [])).toBe(false);
    expect(isAllowedUrl("http://192.168.1.1/", [])).toBe(false);
    expect(isAllowedUrl("http://localhost/", [])).toBe(false);
  });
  it("allows public https", () => {
    expect(isAllowedUrl("https://www.peaceyouthct.org/beyondlimits", [])).toBe(true);
  });
  it("honours a host allowlist", () => {
    expect(isAllowedUrl("https://a.test/x", ["a.test"])).toBe(true);
    expect(isAllowedUrl("https://b.test/x", ["a.test"])).toBe(false);
  });
  it("strips scripts, styles and tags", () => {
    const html = "<html><head><title>T</title></head><body><h1>Hi</h1><script>x()</script><style>a{}</style><p>a  b</p></body></html>";
    const t = htmlToText(html);
    expect(t).toContain("Hi");
    expect(t).toContain("a b");
    expect(t).not.toContain("x()");
    expect(t).not.toContain("a{}");
  });
});
