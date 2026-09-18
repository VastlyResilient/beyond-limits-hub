export type EditKind = "setText" | "setNumber" | "setColor" | "setVisible";

export interface EditableTarget {
  id: string;      // stable, never reused
  label: string;   // plain English, read by Andy AND the model
  kind: EditKind;
  screen: string;  // Route id it appears on
  help: string;    // one line explaining it
}

export const EDIT_REGISTRY: EditableTarget[] = [
  { id: "nav.ops-command.label", label: "Sidebar label — Command Center", kind: "setText",
    screen: "ops-command", help: "The words Andy sees in the left sidebar for his home screen." },
  { id: "nav.ops-composer.label", label: "Sidebar label — Posts & Alerts", kind: "setText",
    screen: "ops-command", help: "Names the screen for sending messages to families." },
  { id: "nav.ops-sessions.label", label: "Sidebar label — Attendance", kind: "setText",
    screen: "ops-command", help: "Names the attendance screen in the sidebar." },
  { id: "nav.ops-forms.label", label: "Sidebar label — Digital Forms", kind: "setText",
    screen: "ops-command", help: "Names the forms and agreements screen." },
  { id: "nav.ops-directory.label", label: "Sidebar label — Directory", kind: "setText",
    screen: "ops-command", help: "Names the people directory screen." },
  { id: "command.greeting", label: "Command Center greeting", kind: "setText",
    screen: "ops-command", help: "The line at the top of the Command Center, e.g. 'Good afternoon, Andy.'" },
  { id: "command.hero.headline", label: "Command Center headline", kind: "setText",
    screen: "ops-command", help: "The big sentence inside the dark card on the Command Center." },
  { id: "command.hero.sub", label: "Command Center sub-heading", kind: "setText",
    screen: "ops-command", help: "The paragraph under the Command Center heading." },
  { id: "brand.accent", label: "Accent colour", kind: "setColor",
    screen: "ops-appearance", help: "The highlight colour used for badges and small call-outs, as #rrggbb." },
];

export const REGISTRY_IDS = EDIT_REGISTRY.map((t) => t.id);

export function getTarget(id: string): EditableTarget | undefined {
  return EDIT_REGISTRY.find((t) => t.id === id);
}

/** A short human sentence describing a target, for the activity log. */
export function describeTarget(id: string): string {
  return getTarget(id)?.label ?? id;
}
