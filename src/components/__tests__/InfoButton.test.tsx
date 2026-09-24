import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { InfoButton } from "../InfoButton";
import { INFO, READY_INFO_IDS, PROPOSED_INFO, PENDING_INFO, RENDERED_INFO_IDS } from "../../lib/infoButtons";

/* The four approved strings are transcribed from the Add-On v3 deck — these
   assertions stop a later refactor paraphrasing them. The seven beta entries
   are grounded in the real data model and each records what still needs
   confirming, so no definition can ship looking more settled than it is. */

describe("info-button registry", () => {
  it("has exactly the four approved buttons ready to build", () => {
    expect(READY_INFO_IDS.sort()).toEqual(["C-01", "C-02", "C-03", "C-05"]);
  });

  it("renders all eleven buttons: four approved plus seven beta definitions", () => {
    expect(RENDERED_INFO_IDS.length).toBe(11);
    expect(PENDING_INFO.length).toBe(0);
  });

  it("every beta definition is grounded and says what still needs confirming", () => {
    expect(PROPOSED_INFO.map((p) => p.id).sort()).toEqual(
      ["C-04", "C-06", "C-09", "F-02", "F-03", "FA-01", "T-02"]);
    for (const p of PROPOSED_INFO) {
      expect(p.status).toBe("proposed");
      expect(p.body.length, `${p.id} needs real copy`).toBeGreaterThan(40);
      expect(p.awaiting && p.awaiting.length, `${p.id} must record what is unconfirmed`).toBeTruthy();
    }
  });

  it("every entry has a heading and a body", () => {
    for (const id of RENDERED_INFO_IDS) {
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

  it("keeps the beta definitions consistent with the data model they describe", () => {
    // F-02 must state the 1-5 -> 0-100 conversion the deck asked for.
    expect(INFO["F-02"].body).toMatch(/1 to 5|0-100/);
    // F-03 must state the 1-5 scale and the minimum sample.
    expect(INFO["F-03"].body).toMatch(/1 to 5/);
    expect(INFO["F-03"].body).toMatch(/five/);
    // C-04 must state its window.
    expect(INFO["C-04"].body).toMatch(/90 days/);
    // FA-01 is family-facing and must reassure about excused absences.
    expect(INFO["FA-01"].body).toMatch(/never count against/i);
    // T-02 must state the scale.
    expect(INFO["T-02"].body).toMatch(/out of 100/);
  });
});

describe("InfoButton", () => {
  it("renders nothing for an unknown id", () => {
    const { container } = render(<InfoButton id="nope" />);
    expect(container.querySelector("button")).toBeNull();
  });

  it("renders a beta definition (proposed is shown, not hidden)", () => {
    render(<InfoButton id="C-09" />);
    expect(screen.getByRole("button", { name: /More information: Reach by group/i })).toBeTruthy();
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
