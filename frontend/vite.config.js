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
      includeAssets: ['ascend-logo.png', 'icon-192x192.png', 'icon-512x512.png', 'vite.svg'],
      manifest: {
        name: 'Ascend — AI Interview Prep',
        short_name: 'Ascend',
        description: 'AI-powered coding, system design, and behavioral interview preparation',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MB — app bundle includes large topic data
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'topics-coding': [
            './src/data/topics/codingTopics.js',
            './src/data/topics/codingTopicsExtra.js',
          ],
          'topics-system-design': [
            './src/data/topics/systemDesignTopics.js',
            './src/data/topics/systemDesignProblems.js',
            './src/data/topics/systemDesignProblemsExtra.js',
            './src/data/topics/systemDesignPatterns.js',
            './src/data/topics/systemDesignTradeoffs.js',
            './src/data/topics/scalableSystemsTopics.js',
          ],
          'topics-microservices': [
            './src/data/topics/microservicesPatterns.js',
          ],
          'topics-database-sql': [
            './src/data/topics/databaseTopics.js',
            './src/data/topics/sqlTopics.js',
          ],
          'topics-lld': [
            './src/data/topics/lldTopics.js',
            './src/data/topics/lldProblems.js',
            './src/data/topics/lldProblemsExtra.js',
          ],
          'topics-behavioral': [
            './src/data/topics/behavioralTopics.js',
            './src/data/topics/companyPrep.js',
            './src/data/topics/concurrencyTopics.js',
          ],
        },
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
