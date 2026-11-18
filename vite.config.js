import { defineConfig } from 'vite';

// Las llamadas a /api se redirigen al servidor local (puerto 3001)
export default defineConfig({
  server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
});