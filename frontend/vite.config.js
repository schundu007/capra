import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use absolute paths for webapp, relative for Electron (set via VITE_BASE_URL env)
  base: process.env.VITE_ELECTRON === 'true' ? './' : '/',
  server: {
    port: 5173,
    allowedHosts: ['localhost', 'electron.test', '.test'],
    proxy: {
      '/api': {
        target: 'http://localhost:3009',
        changeOrigin: true,
        timeout: 120000,
      },
    },
  },
  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
      ],
    },
  },
});
