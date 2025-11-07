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
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif'
        ]
      },
      colors: {
        primary: {
          DEFAULT: '#4f46e5'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
})
