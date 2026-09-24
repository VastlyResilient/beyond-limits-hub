/* ---------------------------------------------------------------------------
   Info-button copy — the single source of truth.

   Every string here is transcribed VERBATIM from
   "Beyond Limits Hub — Implementation Add-On v3" (Sept 19, 2026).
   Do not paraphrase and do not invent copy for a `pending` entry: slide 14 is
   explicit that the seven undefined metrics must wait for Bobby's confirmed
   definitions. `pendingNote` records what is missing, and is never shown to a
   user as though it were an explanation.

   status:
     "ready"   — explanation approved; render the button.
     "pending" — placement approved, copy blocked. Do NOT render.
--------------------------------------------------------------------------- */

export type InfoStatus = "ready" | "pending";

export interface InfoDef {
  id: string;
  heading: string;
  body: string;
  status: InfoStatus;
  /** Slide the decision came from, for traceability. */
  ref: string;
  /** Shown only in the settings/audit list — never as user-facing copy. */
  pendingNote?: string;
}

export const INFO: Record<string, InfoDef> = {
  "C-01": {
    id: "C-01",
    heading: "Auto-translated",
    body: "This conversation uses automatic translation. Replies are translated into the family's preferred language before they are sent.",
    status: "ready",
    ref: "Add-On v3, slide 3",
  },
  "C-02": {
    id: "C-02",
    heading: "96% floor",
    body: "The floor is the lowest projected delivery rate among the channels selected for this message. It shows the weakest channel before you send.",
    status: "ready",
    ref: "Add-On v3, slide 4",
  },
  "C-03": {
    id: "C-03",
    heading: "Back-translation check",
    body: "Translates the message back into English and compares it with the original. This helps spot changes in meaning or tone before the message is approved.",
    status: "ready",
    ref: "Add-On v3, slide 5",
  },
  "C-05": {
    id: "C-05",
    heading: "Merge fields",
    body: "Merge fields replace labels such as {student} and {time} with the correct details for each family before the message is sent.",
    status: "ready",
    ref: "Add-On v3, slide 7",
  },

  /* ---- Awaiting Bobby's definitions (slide 14). Never rendered. ---- */
  "C-04": {
    id: "C-04", heading: "Channel reach", body: "", status: "pending",
    ref: "Add-On v3, slide 6",
    pendingNote: "What counts as reached, the data source, time window, and unit.",
  },
  "C-06": {
    id: "C-06", heading: "Auto-reviewed", body: "", status: "pending",
    ref: "Add-On v3, slide 8",
    pendingNote: "Which checks run and whether a person reviews the translation.",
  },
  "C-09": {
    id: "C-09", heading: "Reach by group", body: "", status: "pending",
    ref: "Add-On v3, slide 9",
    pendingNote: "What makes a family engaged and which date range applies.",
  },
  "F-02": {
    id: "F-02", heading: "Learner confidence", body: "", status: "pending",
    ref: "Add-On v3, slide 10",
    pendingNote: "Score source, period, aggregation, and 1-5 to 0-100 conversion.",
  },
  "F-03": {
    id: "F-03", heading: "Tutor rating", body: "", status: "pending",
    ref: "Add-On v3, slide 11",
    pendingNote: "Who submits ratings, the scale, sample size, and period.",
  },
  "FA-01": {
    id: "FA-01", heading: "Family attendance", body: "", status: "pending",
    ref: "Add-On v3, slide 12",
    pendingNote: "Time period, denominator, and treatment of schedule changes and excused absences.",
  },
  "T-02": {
    id: "T-02", heading: "Skill growth", body: "", status: "pending",
    ref: "Add-On v3, slide 13",
    pendingNote: "Assessment source, scale, Start and Now dates, and score owner.",
  },
};

export const READY_INFO_IDS = Object.values(INFO).filter((i) => i.status === "ready").map((i) => i.id);
export const PENDING_INFO = Object.values(INFO).filter((i) => i.status === "pending");
