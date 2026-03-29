import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const isElectronBuild = process.env.VITE_ELECTRON === 'true';

export default defineConfig({
  plugins: [
    react(),
    // PWA — disabled for Electron builds
    !isElectronBuild && VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['ascend-logo.png', 'ascend-icon.png', 'vite.svg'],
      manifest: {
        name: 'Ascend — AI Coding Assistant',
        short_name: 'Ascend',
        description: 'AI-powered coding assistant for interviews',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/ascend-icon.png', sizes: '192x192', type: 'image/png' },
          { src: '/ascend-icon.png', sizes: '512x512', type: 'image/png' },
          { src: '/ascend-icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB — app bundle is large
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 } },
          },
        ],
      },
    }),
  ].filter(Boolean),
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
