import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { POSTS, FORMS, THREADS, LEDGER, VOLUNTEER_SHIFTS, type Role, ME } from "./data";
export type { Role } from "./data";

/* ------------------------------------------------------------------ routing */
export type Route =
  | "home"
  | "ops-command" | "ops-composer" | "ops-sessions" | "ops-calendar"
  | "ops-payments" | "ops-forms" | "ops-volunteers" | "ops-directory" | "ops-messages"
  | "ops-translation" | "ops-analytics" | "ops-programs" | "ops-appearance"
  | "tutor-today" | "tutor-roster" | "tutor-log" | "tutor-messages"
  | "family-feed" | "family-calendar" | "family-forms" | "family-billing" | "family-messages"
  | "student-sessions"
  | "owner";

export interface Nav { route: Route; go: (r: Route) => void; role: Role; setRole: (r: Role) => void; params: Record<string, any>; setParams: (p: Record<string, any>) => void; }

const NavCtx = createContext<Nav>(null as any);
export const useNav = () => useContext(NavCtx);

export const HOME_ROUTE: Record<Role, Route> = {
  ops: "ops-command", tutor: "tutor-today", family: "family-feed", student: "student-sessions"
};

export const NAV_ITEMS: Record<Role, { group: string; items: { id: Route; label: string; icon: string }[] }[]> = {
  ops: [
    { group: "Today", items: [
      { id: "ops-command", label: "Command Center", icon: "Sun" },
    ]},
    { group: "Communicate", items: [
      { id: "ops-composer", label: "Posts & Alerts", icon: "Megaphone" },
      { id: "ops-messages", label: "Inbox", icon: "MessageSquare" },
      { id: "ops-translation", label: "Translation", icon: "Languages" },
    ]},
    { group: "Attendance", items: [
      { id: "ops-calendar", label: "Calendar & RSVP", icon: "CalendarDays" },
      { id: "ops-sessions", label: "Attendance", icon: "ClipboardList" },
    ]},
    { group: "Families", items: [
      { id: "ops-forms", label: "Digital Forms", icon: "FileSignature" },
      { id: "ops-payments", label: "Payments", icon: "Receipt" },
      { id: "ops-volunteers", label: "Signups", icon: "HeartHandshake" },
      { id: "ops-directory", label: "Directory", icon: "Users" },
    ]},
    { group: "Reach", items: [
      { id: "ops-analytics", label: "Engagement", icon: "BarChart3" },
      { id: "ops-programs", label: "Groups", icon: "Layers" },
    ]},
    { group: "Settings", items: [
      { id: "ops-appearance", label: "Appearance", icon: "Palette" },
    ]},
  ],
  tutor: [
    { group: "My work", items: [
      { id: "tutor-today", label: "Today", icon: "Sun" },
      { id: "tutor-roster", label: "My Students", icon: "Users" },
      { id: "tutor-log", label: "Session Notes", icon: "PenLine" },
      { id: "tutor-messages", label: "Messages", icon: "MessageSquare" },
    ]},
  ],
  family: [
    { group: "Stay close", items: [
      { id: "family-feed", label: "Home", icon: "Home" },
      { id: "family-calendar", label: "Sessions & Events", icon: "CalendarDays" },
    ]},
    { group: "Paperwork", items: [
      { id: "family-forms", label: "Forms", icon: "FileSignature" },
      { id: "family-billing", label: "Payments", icon: "Receipt" },
    ]},
    { group: "Talk to us", items: [
      { id: "family-messages", label: "Messages", icon: "MessageSquare" },
    ]},
  ],
  student: [
    { group: "My learning", items: [
      { id: "student-sessions", label: "My Schedule", icon: "CalendarDays" },
    ]},
  ],
};

/* -------------------------------------------------------------------- store */
const ROUTES: Route[] = ["home","ops-command","ops-composer","ops-sessions","ops-calendar","ops-payments","ops-forms","ops-volunteers","ops-directory","ops-messages","ops-translation","ops-analytics","ops-programs","ops-appearance","tutor-today","tutor-roster","tutor-log","tutor-messages","family-feed","family-calendar","family-forms","family-billing","family-messages","student-sessions","owner"];

const readHash = (): Route => {
  const h = (typeof window !== "undefined" ? window.location.hash.replace(/^#\/?/, "") : "") as Route;
  return (ROUTES as string[]).includes(h) ? h : "home";
};
const roleOf = (r: Route): Role | null =>
  r.startsWith("ops-") ? "ops" : r.startsWith("tutor-") ? "tutor" : r.startsWith("family-") ? "family" : r.startsWith("student-") ? "student" : null;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>(readHash);
  const [role, setRoleRaw] = useState<Role>("ops");
  const [params, setParams] = useState<Record<string, any>>({});
  const [posts, setPosts] = useState(POSTS);
  const [forms, setForms] = useState(FORMS);
  const [threads, setThreads] = useState(THREADS);
  const [log] = useState(LEDGER);
  const [shifts, setShifts] = useState(VOLUNTEER_SHIFTS);
  const [dispatched, setDispatched] = useState<{ id: string; name: string; at: string; reach: number; channels: string[]; urgent: boolean }[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});
  const [readPost, setReadPost] = useState<Record<string, boolean>>({});

  const go = useCallback((r: Route) => {
    setRoute(r); setParams({});
    if (typeof window !== "undefined") { window.location.hash = "/" + r; window.scrollTo({ top: 0, behavior: "smooth" }); }
    const ro = roleOf(r); if (ro) setRoleRaw(ro);
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleRaw(r); setRoute(HOME_ROUTE[r]); setParams({});
    if (typeof window !== "undefined") window.location.hash = "/" + HOME_ROUTE[r];
  }, []);

  React.useEffect(() => {
    const onHash = () => { const r = readHash(); setRoute(r); const ro = roleOf(r); if (ro) setRoleRaw(ro); };
    window.addEventListener("hashchange", onHash);
    const r0 = readHash(); const ro0 = roleOf(r0); if (ro0) setRoleRaw(ro0);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const value: Nav & {
    posts: typeof posts; setPosts: typeof setPosts;
    forms: typeof forms; setForms: typeof setForms;
    threads: typeof threads; setThreads: typeof setThreads;
    ledger: typeof log; shifts: typeof shifts; setShifts: typeof setShifts;
    dispatched: typeof dispatched; setDispatched: typeof setDispatched;
    rsvps: typeof rsvps; setRsvps: typeof setRsvps;
    readPost: typeof readPost; setReadPost: typeof setReadPost;
    me: typeof ME[Role];
  } = {
    route, go, role, setRole, params, setParams,
    posts, setPosts, forms, setForms, threads, setThreads,
    ledger: log, shifts, setShifts, dispatched, setDispatched,
    rsvps, setRsvps, readPost, setReadPost, me: ME[role],
  };

  return <NavCtx.Provider value={value as any}>{children}</NavCtx.Provider>;
}

export type AppStore = ReturnType<typeof useApp>;
export function useApp() {
  const v = useContext(NavCtx) as any;
  return v as Nav & {
    posts: typeof POSTS; setPosts: React.Dispatch<React.SetStateAction<typeof POSTS>>;
    forms: typeof FORMS; setForms: React.Dispatch<React.SetStateAction<typeof FORMS>>;
    threads: typeof THREADS; setThreads: React.Dispatch<React.SetStateAction<typeof THREADS>>;
    ledger: typeof LEDGER; shifts: typeof VOLUNTEER_SHIFTS; setShifts: React.Dispatch<React.SetStateAction<typeof VOLUNTEER_SHIFTS>>;
    dispatched: { id: string; name: string; at: string; reach: number; channels: string[]; urgent: boolean }[];
    setDispatched: React.Dispatch<React.SetStateAction<{ id: string; name: string; at: string; reach: number; channels: string[]; urgent: boolean }[]>>;
    rsvps: Record<string, boolean>; setRsvps: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    readPost: Record<string, boolean>; setReadPost: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    me: typeof ME[Role];
  };
}
