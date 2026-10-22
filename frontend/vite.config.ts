/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/_allauth': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
    },
  },
  test: {
    environment: 'happy-dom',
  },
});
