export const config = {
  ollamaApiUrl: import.meta.env.VITE_OLLAMA_API_URL,

  // Add other configuration values here
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Type for the config object
export type Config = typeof config;
