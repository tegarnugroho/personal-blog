import { defineNuxtConfig } from "nuxt/config";

// Nuxt 3 configuration for a static blog with @nuxt/content and Decap CMS
export default defineNuxtConfig({
  // Add compatibility date for latest features
  compatibilityDate: '2025-11-07',
  
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxtjs/color-mode'
  ],
  css: ['~/assets/css/tailwind.css'],
  
  // PostCSS configuration for Tailwind
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  
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
      },
      preload: ['ts','js','json','bash','html','css','vue','md']
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
  // Sitemap configuration
  sitemap: {
    sources: ['/api/sitemap-urls']
  },
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/feed.xml']
    }
  },
})

