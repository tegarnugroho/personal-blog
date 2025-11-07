import type { Config } from 'tailwindcss'

export default <Partial<Config>>({
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './content/**/*.md'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
})

