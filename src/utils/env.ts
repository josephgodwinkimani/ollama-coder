export const validateEnv = () => {
  const requiredEnvVars = ['VITE_OLLAMA_API_URL'];

  const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
        'Please check your .env file and make sure all required variables are set.'
    );
  }

  // Validate URL format
  try {
    new URL(import.meta.env.VITE_OLLAMA_API_URL);
  } catch (error) {
    throw new Error(
      `Invalid VITE_OLLAMA_API_URL: ${import.meta.env.VITE_OLLAMA_API_URL}\n` +
        'Please provide a valid URL in your .env file.'
    );
  }
};
