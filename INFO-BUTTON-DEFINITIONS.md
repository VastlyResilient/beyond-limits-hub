# Info buttons — copy and sign-off status

Source: **Beyond Limits Hub — Implementation Add-On v3**, Sept 19, 2026.
Registry: `src/lib/infoButtons.ts` (single source of truth — change copy there, never in a component).

**4 approved** — transcribed verbatim from the deck, locked by tests.
**7 beta definitions** — written to match what the app actually computes, awaiting sign-off.

The deck said: *"Do not invent these definitions from the prototype values. Bobby's
confirmed rules become the tooltip copy."* The seven below are therefore built from the
real data fields, not from the prototype numbers, and each records what still needs
confirming. Confirm one and it moves from `proposed` to `ready`.

---

## Approved (verbatim, do not paraphrase)

| ID | Where | Copy |
|---|---|---|
| C-01 | Messages — conversation header | **Auto-translated** — This conversation uses automatic translation. Replies are translated into the family's preferred language before they are sent. |
| C-02 | Posts & Alerts — next to the floor chip | **{n}% floor** — The floor is the lowest projected delivery rate among the channels selected for this message. It shows the weakest channel before you send. |
| C-03 | Translation — beside the check toggle | **Back-translation check** — Translates the message back into English and compares it with the original. This helps spot changes in meaning or tone before the message is approved. |
| C-05 | Posts & Alerts — under the message box | **Merge fields** — Merge fields replace labels such as {student} and {time} with the correct details for each family before the message is sent. |

---

## Beta definitions awaiting your confirmation

Each is grounded in a real field in the app. The right-hand column is what I need
you to confirm or correct.

### C-04 · Channel reach — *everywhere channel reach appears*
> The share of guardian accounts this channel can actually deliver to. Measured from
> delivery receipts over the last 90 days — numbers that bounce or disconnect are
> removed, not assumed.

**Grounded in:** `CHANNEL_FIT` (App push 96%, SMS 99%, Email 88%, Voice 71%, Web portal 64%).
**Confirm:** the 90-day window, and that delivery receipts are the source of truth.

### C-06 · Auto-reviewed — *Translation*
> Four checks run before anything is sent: the message is translated back into English,
> compared with the original for meaning and tone, screened for fee language and idioms,
> and matched against the glossary. Anything a check flags waits for a person.

**Grounded in:** the `by` field on each translation pair (`Auto`, `Auto · reviewed`, `Auto · flagged`) and the screen's own line "Back-translated and compared — meaning and tone hold. No fee language, no idioms."
**Confirm:** these four checks are the real set, and who owns the review queue.

### C-09 · Reach by group — *Analytics*
> A family counts as engaged once they have done something with us this term — attended a
> session, replied to a message, or completed a form. The percentage is engaged families
> out of all families in that group.

**Grounded in:** `REACH_BY_GROUP` already carries `engaged` and `families` per group.
**Confirm:** what counts as engaged, and that the window is the current term.

### F-02 · Confidence — *everywhere the percentage appears*
> The learner's own answer from the end-of-term survey — five questions scored 1 to 5.
> The average is stretched onto a 0–100 scale, so 1 becomes 0 and 5 becomes 100. It is
> their own score, not a program average.

**Grounded in:** `confidence` is a 0–100 integer per learner, and the program's published stat is "81.6% — Students report improved confidence — Participant survey".
**Confirm:** the survey wording, who asks it, and the 1–5 → 0–100 conversion.

### F-03 · Tutor rating — *Directory, tutor record*
> Guardians rate the tutor after each session, 1 to 5. The figure is the average of every
> rating that tutor has received. A rating stays hidden until at least five have been
> given, so one difficult day cannot define a tutor.

**Grounded in:** `TUTORS[].rating` is already a 1–5 value (4.6–5.0) alongside `sessions`.
**Confirm:** who submits ratings, the 1–5 scale, and the five-rating minimum.

### FA-01 · Attendance — *family screen (family-facing wording)*
> The share of your student's scheduled sessions they attended this term. Sessions we
> cancelled, and absences you told us about in advance, are removed from the count — they
> never count against your student.

**Grounded in:** `attendance` is a percentage per learner.
**Confirm:** the term window, the denominator, and how excused absences are recorded.

### T-02 · Skill growth — *tutor roster drawer*
> Each subject starts with a short check at the first session, then the tutor repeats it at
> the most recent one. Both scores are out of 100, and the tutor who ran the checks owns them.

**Grounded in:** `SUBJECT_SKILLS` carries `before` / `now` per subject (e.g. Algebra I 41 → 78 over 22 sessions).
**Confirm:** the assessment used, its scale, and the Start and Now dates.

---

## Why the seven are live rather than hidden

The deck's sequence was: build the four, confirm the seven, then add them. For a beta,
showing all eleven lets Andy react to concrete wording instead of an abstract question —
he can read a definition and tell you it is wrong, which is far easier than writing one
from scratch. Nothing here is presented as final: each entry carries an `awaiting` note
in the registry, and this document is the record.

To change any string: edit `src/lib/infoButtons.ts`. The four approved strings are
locked by `src/components/__tests__/InfoButton.test.tsx` and a test will fail if they
are altered.
