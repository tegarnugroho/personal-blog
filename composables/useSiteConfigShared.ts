import type { SiteConfig } from '~/types'

// Shared site config state
export const useSiteConfigShared = () => {
  const config = useRuntimeConfig().public

  const { data: siteConfig, pending, error, refresh } = useAsyncData('global-site-config', async () => {
    try {
      const local = await queryContent('/config').findOne()
      if (!local) throw new Error('site config missing')
      return {
        title: local.title || config.siteTitle || 'My Blog',
        description: local.description || config.siteDescription || 'Thoughts on coding, tech, and life.',
        author: local.author || 'Your Name',
        primary: local.primary || '#3b82f6',
        _source: 'local' as const
      } as SiteConfig
    } catch (err) {
      console.error('Failed to load local site config:', err)
      return {
        title: config.siteTitle || 'My Blog',
        description: config.siteDescription || 'Thoughts on coding, tech, and life.',
        author: 'Your Name',
        primary: '#3b82f6',
        _source: 'fallback' as const
      } satisfies SiteConfig
    }
  }, {
    server: true,
    default: () => ({
      title: config.siteTitle || 'My Blog',
      description: config.siteDescription || 'Thoughts on coding, tech, and life.',
      author: 'Your Name',
      primary: '#3b82f6',
      _source: 'fallback' as const
    })
  })

  return { siteConfig, pending, error, refresh }
}
