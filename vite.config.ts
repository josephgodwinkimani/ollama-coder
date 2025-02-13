import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_OLLAMA_API_URL || 'http://localhost:11434',
        changeOrigin: true,
      },
    },
  },
})