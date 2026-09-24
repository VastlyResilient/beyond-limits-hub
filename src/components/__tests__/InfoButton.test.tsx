import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { InfoButton } from "../InfoButton";
import { INFO, READY_INFO_IDS, PENDING_INFO } from "../../lib/infoButtons";

/* Copy is transcribed from the Add-On v3 deck. These assertions exist so a
   later refactor cannot quietly paraphrase approved wording, and so the seven
   blocked definitions can never ship as invented text. */

describe("info-button registry", () => {
  it("has exactly the four approved buttons ready to build", () => {
    expect(READY_INFO_IDS.sort()).toEqual(["C-01", "C-02", "C-03", "C-05"]);
  });

  it("holds the seven blocked definitions with NO body text", () => {
    expect(PENDING_INFO.map((p) => p.id).sort()).toEqual(["C-04", "C-06", "C-09", "F-02", "F-03", "FA-01", "T-02"]);
    for (const p of PENDING_INFO) {
      expect(p.body, `${p.id} must not carry invented copy`).toBe("");
      expect(p.pendingNote && p.pendingNote.length).toBeTruthy();
    }
  });

  it("every ready entry has a heading and a body", () => {
    for (const id of READY_INFO_IDS) {
      expect(INFO[id].heading.length).toBeGreaterThan(0);
      expect(INFO[id].body.length).toBeGreaterThan(20);
    }
  });

  it("locks the approved wording verbatim", () => {
    expect(INFO["C-01"].body).toBe(
      "This conversation uses automatic translation. Replies are translated into the family's preferred language before they are sent.");
    expect(INFO["C-02"].body).toBe(
      "The floor is the lowest projected delivery rate among the channels selected for this message. It shows the weakest channel before you send.");
    expect(INFO["C-03"].body).toBe(
      "Translates the message back into English and compares it with the original. This helps spot changes in meaning or tone before the message is approved.");
    expect(INFO["C-05"].body).toBe(
      "Merge fields replace labels such as {student} and {time} with the correct details for each family before the message is sent.");
    expect(INFO["C-03"].heading).toBe("Back-translation check");
    expect(INFO["C-05"].heading).toBe("Merge fields");
  });
});

describe("InfoButton", () => {
  it("renders nothing for a pending definition", () => {
    const { container } = render(<InfoButton id="C-04" />);
    expect(container.querySelector("button")).toBeNull();
    expect(container.textContent).toBe("");
  });

  it("renders nothing for an unknown id", () => {
    const { container } = render(<InfoButton id="nope" />);
    expect(container.querySelector("button")).toBeNull();
  });

  it("renders an accessible button for a ready definition", () => {
    render(<InfoButton id="C-01" />);
    const btn = screen.getByRole("button", { name: /More information: Auto-translated/i });
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens on click and shows heading then body", () => {
    render(<InfoButton id="C-01" />);
    const btn = screen.getByRole("button", { name: /More information/i });
    fireEvent.click(btn);
    const tip = screen.getByRole("tooltip");
    expect(tip.textContent).toContain("Auto-translated");
    expect(tip.textContent).toContain("automatic translation");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("uses the live heading override for the floor percentage", () => {
    render(<InfoButton id="C-02" headingOverride="96% floor" />);
    fireEvent.click(screen.getByRole("button", { name: /More information: 96% floor/i }));
    expect(screen.getByRole("tooltip").textContent).toContain("96% floor");
  });

  it("closes on Escape", () => {
    render(<InfoButton id="C-03" />);
    fireEvent.click(screen.getByRole("button", { name: /More information/i }));
    expect(screen.queryByRole("tooltip")).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
