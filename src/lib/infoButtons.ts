/* ---------------------------------------------------------------------------
   Info-button copy.

   Four entries (C-01, C-02, C-03, C-05) are transcribed VERBATIM from
   "Beyond Limits Hub - Implementation Add-On v3" (Sept 19, 2026). Approved copy
   is locked by tests; do not paraphrase it.

   Seven entries (C-04, C-06, C-09, F-02, F-03, FA-01, T-02) are BETA WORKING
   DEFINITIONS. The deck reserved them for Bobby's sign-off and forbade inventing
   them, so each one is written to match what the app actually computes - the
   field it reads, the scale it uses, and the window it covers. They are marked
   `proposed` and `awaiting` records exactly what still needs confirming. Change
   the wording here, never in a component.

   status:
     "ready"    - approved explanation, locked verbatim.
     "proposed" - beta definition, grounded in the data model, awaiting sign-off.
     "pending"  - copy blocked, not rendered.
--------------------------------------------------------------------------- */

export type InfoStatus = "ready" | "proposed" | "pending";

export interface InfoDef {
  id: string;
  heading: string;
  body: string;
  status: InfoStatus;
  /** Slide the decision came from, for traceability. */
  ref: string;
  /** For `proposed`: what a human still needs to confirm. Never user-facing. */
  awaiting?: string;
}

export const INFO: Record<string, InfoDef> = {
  /* ---------------- Approved verbatim ---------------- */
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

  /* -------- Beta definitions, grounded in the data model -------- */
  "C-04": {
    id: "C-04",
    heading: "Channel reach",
    body: "The share of guardian accounts this channel can actually deliver to. Measured from delivery receipts over the last 90 days - numbers that bounce or disconnect are removed, not assumed.",
    status: "proposed",
    ref: "Add-On v3, slide 6",
    awaiting: "Confirm the window (90 days) and that delivery receipts are the source of truth.",
  },
  "C-06": {
    id: "C-06",
    heading: "Auto-reviewed",
    body: "Four checks run before anything is sent: the message is translated back into English, compared with the original for meaning and tone, screened for fee language and idioms, and matched against the glossary. Anything a check flags waits for a person.",
    status: "proposed",
    ref: "Add-On v3, slide 8",
    awaiting: "Confirm these four checks are the real set, and who owns the review queue.",
  },
  "C-09": {
    id: "C-09",
    heading: "Reach by group",
    body: "A family counts as engaged once they have done something with us this term - attended a session, replied to a message, or completed a form. The percentage is engaged families out of all families in that group.",
    status: "proposed",
    ref: "Add-On v3, slide 9",
    awaiting: "Confirm what counts as engaged, and that the window is the current term.",
  },
  "F-02": {
    id: "F-02",
    heading: "Confidence",
    body: "The learner's own answer from the end-of-term survey - five questions scored 1 to 5. The average is stretched onto a 0-100 scale, so 1 becomes 0 and 5 becomes 100. It is their own score, not a program average.",
    status: "proposed",
    ref: "Add-On v3, slide 10",
    awaiting: "Confirm the survey wording, who asks it, and the 1-5 to 0-100 conversion.",
  },
  "F-03": {
    id: "F-03",
    heading: "Tutor rating",
    body: "Guardians rate the tutor after each session, 1 to 5. The figure is the average of every rating that tutor has received. A rating stays hidden until at least five have been given, so one difficult day cannot define a tutor.",
    status: "proposed",
    ref: "Add-On v3, slide 11",
    awaiting: "Confirm who submits ratings, the 1-5 scale, and the five-rating minimum.",
  },
  "FA-01": {
    id: "FA-01",
    heading: "Attendance",
    body: "The share of your student's scheduled sessions they attended this term. Sessions we cancelled, and absences you told us about in advance, are removed from the count - they never count against your student.",
    status: "proposed",
    ref: "Add-On v3, slide 12",
    awaiting: "Confirm the term window, the denominator, and how excused absences are recorded.",
  },
  "T-02": {
    id: "T-02",
    heading: "Skill growth",
    body: "Each subject starts with a short check at the first session, then the tutor repeats it at the most recent one. Both scores are out of 100, and the tutor who ran the checks owns them.",
    status: "proposed",
    ref: "Add-On v3, slide 13",
    awaiting: "Confirm the assessment used, its scale, and the Start and Now dates.",
  },
};

export const READY_INFO_IDS = Object.values(INFO).filter((i) => i.status === "ready").map((i) => i.id);
export const PROPOSED_INFO = Object.values(INFO).filter((i) => i.status === "proposed");
export const PENDING_INFO = Object.values(INFO).filter((i) => i.status === "pending");
/** Every id that renders a button. */
export const RENDERED_INFO_IDS = Object.values(INFO).filter((i) => i.status !== "pending").map((i) => i.id);
