/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GROK_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
