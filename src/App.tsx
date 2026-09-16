import React from "react";
import { StoreProvider, useApp } from "./lib/store";
import { ToastHost } from "./components/ui";
import { Shell } from "./components/Shell";
import { ThemeProvider } from "./lib/theme";
import Landing from "./routes/Landing";

import OpsCommand from "./routes/ops/Command";
import OpsComposer from "./routes/ops/Composer";
import OpsSessions from "./routes/ops/Sessions";
import OpsCalendar from "./routes/ops/Calendar";
import OpsPayments from "./routes/ops/Payments";
import OpsForms from "./routes/ops/Forms";
import OpsVolunteers from "./routes/ops/Volunteers";
import OpsDirectory from "./routes/ops/Directory";
import OpsMessages from "./routes/ops/Messages";
import OpsTranslation from "./routes/ops/Translation";
import OpsAnalytics from "./routes/ops/Analytics";
import OpsPrograms from "./routes/ops/Programs";
import OpsAppearance from "./routes/ops/Appearance";

import TutorToday from "./routes/tutor/Today";
import TutorRoster from "./routes/tutor/Roster";
import TutorLog from "./routes/tutor/Log";
import TutorMessages from "./routes/tutor/Messages";

import FamilyFeed from "./routes/family/Feed";
import FamilyCalendar from "./routes/family/Calendar";
import FamilyForms from "./routes/family/Forms";
import FamilyBilling from "./routes/family/Billing";
import FamilyMessages from "./routes/family/Messages";

import StudentSessions from "./routes/student/Sessions";

function NotFound() {
  return <div className="p-10 text-center text-ink/50">Screen not found.</div>;
}

function Router() {
  const { route } = useApp();
  const map: Record<string, React.ComponentType> = {
    "ops-command": OpsCommand, "ops-composer": OpsComposer, "ops-sessions": OpsSessions,
    "ops-calendar": OpsCalendar, "ops-payments": OpsPayments,
    "ops-forms": OpsForms, "ops-volunteers": OpsVolunteers, "ops-directory": OpsDirectory,
    "ops-messages": OpsMessages, "ops-translation": OpsTranslation, "ops-analytics": OpsAnalytics,
    "ops-programs": OpsPrograms, "ops-appearance": OpsAppearance,
    "tutor-today": TutorToday, "tutor-roster": TutorRoster, "tutor-log": TutorLog, "tutor-messages": TutorMessages,
    "family-feed": FamilyFeed, "family-calendar": FamilyCalendar,
    "family-forms": FamilyForms, "family-billing": FamilyBilling, "family-messages": FamilyMessages, "student-sessions": StudentSessions,
  };
  const C = map[route] || NotFound;
  return <div key={route} className="animate-rise px-4 py-7 sm:px-7 sm:py-9 max-w-[1320px] mx-auto"><C /></div>;
}

function Root() {
  const { route } = useApp();
  if (route === "home") return <Landing />;
  return <Shell><Router /></Shell>;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastHost>
        <StoreProvider>
          <Root />
        </StoreProvider>
      </ToastHost>
    </ThemeProvider>
  );
}
