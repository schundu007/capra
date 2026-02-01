import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use relative paths for Electron file:// protocol compatibility
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3009',
        changeOrigin: true,
        timeout: 120000,
      },
    },
  },
});
