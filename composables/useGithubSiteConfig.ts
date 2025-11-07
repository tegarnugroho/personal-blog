import type { SiteConfig } from '~/types'

export const useGithubSiteConfig = () => {
  // Function to fetch site config from GitHub API
  const fetchFromGitHub = async (): Promise<SiteConfig> => {
    try {
      console.log('🔄 Fetching site config from GitHub API...')
      
      // Get the site.json file from GitHub
      const fileResponse = await $fetch(
        'https://api.github.com/repos/tegarnugroho/personal-blog/contents/content/config/site.json',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'personal-blog'
          }
        }
      ) as any

      if (!fileResponse || !fileResponse.download_url) {
        throw new Error('Site config not found on GitHub')
      }

      // Fetch the actual content
      const content = await $fetch(fileResponse.download_url) as string
      
      // Parse JSON
      const config = JSON.parse(content) as SiteConfig
      
      console.log('✅ Successfully fetched site config from GitHub')
      return {
        ...config,
        _source: 'github'
      }

    } catch (err: any) {
      console.error('❌ GitHub API error for site config:', err)
      throw err
    }
  }

  // Function to fetch from local content
  const fetchFromLocal = async (): Promise<SiteConfig> => {
    const localConfig = await queryContent('/config/site').findOne()
    if (!localConfig) {
      throw new Error('Site config not found locally')
    }
    
    console.log('📁 Using local site config')
    return {
      title: localConfig.title || 'My Blog',
      description: localConfig.description || 'Thoughts on coding, tech, and life.',
      author: localConfig.author || 'Your Name',
      primary: localConfig.primary || '#3b82f6',
      _source: 'local'
    }
  }

  // Fetch with fallback
  const fetchSiteConfig = async (): Promise<SiteConfig> => {
    try {
      // Try GitHub API first
      return await fetchFromGitHub()
    } catch (error) {
      // Fallback to local content
      console.warn('⚠️ GitHub API failed for site config, using local content')
      return await fetchFromLocal()
    }
  }

  return {
    fetchFromGitHub,
    fetchFromLocal,
    fetchSiteConfig
  }
}