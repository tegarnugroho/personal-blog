// Nuxt 3 configuration for a static blog with @nuxt/content and Decap CMS
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxtjs/color-mode'
  ],
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', href: '/favicon.ico' }]
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      siteTitle: 'My Blog',
      siteDescription: 'Thoughts on coding, tech, and life.'
    }
  },
  routeRules: {
    '/**': { prerender: true }
  },
  // @nuxt/content configuration: Shiki-based code highlighting
  content: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark'
      }
    }
  },
  // @nuxt/image: use default local provider; good with static hosting
  image: {},
  // Color mode toggling via class
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light'
  },
  // Sitemap using server-provided route list
  sitemap: {
    siteUrl: process.env.SITE_URL,
    sources: ['/api/sitemap-urls']
  },
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/feed.xml']
    }
  },
})

