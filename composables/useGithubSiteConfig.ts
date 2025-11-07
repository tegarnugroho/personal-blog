import type { SiteConfig } from '~/types'

export const useGithubSiteConfig = () => {
  // Local-only site config fetcher (no GitHub API)
  const fetchFromLocal = async (): Promise<SiteConfig> => {
    try {
      const localConfig = await queryContent('/config/site').findOne()
      if (!localConfig) throw new Error('Site config not found locally')
      return {
        title: localConfig.title || 'My Blog',
        description: localConfig.description || 'Thoughts on coding, tech, and life.',
        author: localConfig.author || 'Your Name',
        primary: localConfig.primary || '#3b82f6',
        _source: 'local'
      }
    } catch (error) {
      console.error('Failed to fetch local site config:', error)
      return {
        title: 'My Blog',
        description: 'Thoughts on coding, tech, and life.',
        author: 'Your Name',
        primary: '#3b82f6',
        _source: 'fallback'
      }
    }
  }

  const fetchSiteConfig = async (): Promise<SiteConfig> => {
    // Always use local content to avoid GitHub dependency
    return await fetchFromLocal()
  }

  return { fetchFromLocal, fetchSiteConfig }
}

