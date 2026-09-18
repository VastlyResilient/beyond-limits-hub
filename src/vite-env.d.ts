/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_ANDY_API?: string;
  readonly VITE_ANDY_MOCK?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
