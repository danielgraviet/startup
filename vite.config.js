import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true, // Ensure host header matches target
        secure: false, // Disable SSL verification for local dev
        logLevel: 'debug', // Log proxy requests in Vite console
      }
    },
  },
});