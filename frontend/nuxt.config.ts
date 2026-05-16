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
      apiBaseUrl: 'http://localhost:3001'
    }
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001/api',
        changeOrigin: true
      }
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Where Did My Time Go',
      short_name: 'TimeGo',
      description: 'Track, reflect, and improve how you spend your time',
      theme_color: '#0f172a',
      background_color: '#ffffff',
      display: 'standalone'
    }
  }
})
