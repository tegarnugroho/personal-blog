import type { SiteConfig } from '~/types'
import { useGithubSiteConfig } from './useGithubSiteConfig'

// Shared site config state
export const useSiteConfigShared = () => {
  const config = useRuntimeConfig().public
  const { fetchSiteConfig } = useGithubSiteConfig()

  // Global singleton for site config
  const { data: siteConfig, pending, error, refresh } = useAsyncData('global-site-config', async () => {
    try {
      return await fetchSiteConfig()
    } catch (error) {
      console.error('Failed to fetch site config:', error)
      return {
        title: config.siteTitle || 'My Blog',
        description: config.siteDescription || 'Thoughts on coding, tech, and life.',
        author: 'Your Name',
        primary: '#3b82f6',
        _source: 'fallback'
      } as SiteConfig
    }
  })

  return {
    siteConfig,
    pending,
    error,
    refresh
  }
}