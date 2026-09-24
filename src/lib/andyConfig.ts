/* The deployed andy-api. Kept in sync with .env.production — this is the value
   used when VITE_ANDY_API is absent, so it must be the real host. The old value
   (andy-api.up.railway.app) returns 404 and produced a silent "network error". */
const PRODUCTION_API = "https://andy-api-production.up.railway.app";

export function resolveAndApiBase(explicit?: string): string {
  const v = (explicit ?? "").trim();
  if (!v) return PRODUCTION_API;
  return v.replace(/\/+$/, "");
}

export const ANDY_API_BASE = resolveAndApiBase(import.meta.env.VITE_ANDY_API as string | undefined);

export function isAndyConfigured(base: string): boolean {
  return base.trim().length > 0;
}

/** Mock mode makes the Builder deterministic for tests and demos. */
export const ANDY_MOCK = (import.meta.env.VITE_ANDY_MOCK as string | undefined) === "1";
