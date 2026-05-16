import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './app/**/*.{vue,js,ts}',
    './error.vue'
  ],
  theme: {
    extend: {}
  },
  plugins: [animate]
} satisfies Config
