import { config } from '../config/env.config';

const OLLAMA_API_URL = config.ollamaApiUrl;

interface ChatOptions {
  temperature?: number;
  num_cores?: number;
}

export const ollamaApi = {
  async listModels(): Promise<{ models: Array<{ name: string }> }> {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
    return response.json();
  },

  async chat(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: ChatOptions
  ) {
    const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options?.temperature,
          num_threads: options?.num_cores,
        },
      }),
    });
    return response.json();
  },
};
