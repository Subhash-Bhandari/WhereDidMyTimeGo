// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  experimental: {
    // Avoids Vite "#app-manifest" resolution failures in monorepo + PWA (Phase 1 is web-only dev)
    appManifest: false
  },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      appName: 'Where Did My Time Go',
      // Empty in dev: same-origin /api/* via nitro devProxy (no CORS). Set NUXT_PUBLIC_API_BASE_URL in prod.
      apiBaseUrl: ''
    }
  },
  routeRules: {
    '/api/**': { proxy: 'http://127.0.0.1:3001/api/**' }
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true
        }
      }
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['icons/*.png'],
    manifest: {
      name: 'Where Did My Time Go',
      short_name: 'TimeGo',
      description: 'Track, reflect, and improve how you spend your time',
      theme_color: '#0f172a',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icons/maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/icons/apple-touch-icon-180x180.png',
          sizes: '180x180',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-assets',
            expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 }
          }
        },
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 }
          }
        },
        {
          urlPattern: ({ url, request }) =>
            request.method === 'GET' && url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-reads',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 48, maxAgeSeconds: 60 * 60 }
          }
        }
      ]
    },
    client: {
      installPrompt: true
    }
  }
})
