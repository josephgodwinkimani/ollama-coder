/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OLLAMA_API_URL: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
