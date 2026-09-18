const PRODUCTION_API = "https://andy-api.up.railway.app";

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
