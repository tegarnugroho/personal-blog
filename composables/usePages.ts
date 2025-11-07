import type { GitHubFile, PageContent } from '~/types'

export const usePages = () => {
  // Function to fetch single page from GitHub API
  const fetchPageFromGitHub = async (slug: string): Promise<PageContent> => {
    try {
      console.log(`🔄 Fetching page "${slug}" from GitHub API...`)
      
      // Get the specific file from GitHub
      const fileName = `${slug}.md`
      const fileResponse = await $fetch(
        `https://api.github.com/repos/tegarnugroho/personal-blog/contents/content/pages/${fileName}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'personal-blog'
          }
        }
      ) as any

      if (!fileResponse || !fileResponse.download_url) {
        throw new Error(`Page "${slug}" not found on GitHub`)
      }

      // Fetch the actual content
      const content = await $fetch(fileResponse.download_url) as string
      
      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
      const frontmatter: any = {}
      
      if (frontmatterMatch) {
        frontmatterMatch[1].split('\n').forEach((line: string) => {
          const colonIndex = line.indexOf(':')
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim()
            const value = line.substring(colonIndex + 1).trim()
            // String (remove quotes)
            frontmatter[key] = value.replace(/^["']|["']$/g, '')
          }
        })
      }

      // Extract body content
      const body = frontmatterMatch 
        ? content.slice(frontmatterMatch[0].length).trim()
        : content

      const page: PageContent = {
        _path: `/pages/${slug}`,
        title: frontmatter.title || slug.charAt(0).toUpperCase() + slug.slice(1),
        body,
        _source: 'github'
      }

      console.log(`✅ Successfully fetched page "${slug}" from GitHub`)
      return page

    } catch (err: any) {
      console.error(`❌ GitHub API error for page "${slug}":`, err)
      throw err
    }
  }

  // Function to fetch all pages from GitHub API
  const fetchAllPagesFromGitHub = async (): Promise<PageContent[]> => {
    try {
      console.log('🔄 Fetching all pages from GitHub API...')
      
      // Fetch file list from GitHub
      const filesResponse = await $fetch('https://api.github.com/repos/tegarnugroho/personal-blog/contents/content/pages', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'personal-blog'
        }
      }) as GitHubFile[]

      if (!Array.isArray(filesResponse)) {
        throw new Error('Invalid response from GitHub API')
      }

      // Filter markdown files
      const markdownFiles = filesResponse.filter((file: GitHubFile) => 
        file.name.endsWith('.md') && file.type === 'file'
      )

      console.log(`📄 Found ${markdownFiles.length} page files on GitHub`)

      // Fetch content for each file
      const pages = await Promise.all(
        markdownFiles.map(async (file: GitHubFile): Promise<PageContent | null> => {
          try {
            const slug = file.name.replace('.md', '')
            return await fetchPageFromGitHub(slug)
          } catch (error) {
            console.error(`Error processing page ${file.name}:`, error)
            return null
          }
        })
      )

      // Filter valid pages
      const validPages = pages.filter((page): page is PageContent => page !== null)

      console.log(`✅ Successfully fetched ${validPages.length} pages from GitHub`)
      return validPages

    } catch (err: any) {
      console.error('❌ GitHub API error for pages:', err)
      throw err
    }
  }

  // Function to fetch from local content
  const fetchPageFromLocal = async (slug: string): Promise<PageContent> => {
    try {
      const localPage = await queryContent('/pages').where({ _path: `/pages/${slug}` }).findOne()
      if (!localPage) {
        throw new Error(`Page "${slug}" not found locally`)
      }
      
      console.log(`📁 Using local content for page "${slug}"`)
      
      return {
        _path: localPage._path || `/pages/${slug}`,
        title: localPage.title || slug.charAt(0).toUpperCase() + slug.slice(1),
        body: typeof localPage.body === 'string' ? localPage.body : '',
        _source: 'local'
      }
    } catch (error) {
      console.error(`Failed to fetch local page "${slug}":`, error)
      throw new Error(`Page "${slug}" not found`)
    }
  }

  // Function to fetch all pages from local content
  const fetchAllPagesFromLocal = async (): Promise<PageContent[]> => {
    try {
      const localPages = await queryContent('/pages')
        .only(['_path', 'title', 'body'])
        .find()
      
      console.log(`📁 Using local content: ${localPages.length} pages`)
      return localPages.map((page: any) => ({
        _path: page._path,
        title: page.title,
        body: page.body || '',
        _source: 'local' as const
      })) as PageContent[]
    } catch (error) {
      console.error('Failed to fetch local pages:', error)
      return []
    }
  }

  // Fetch single page with fallback
  const fetchPage = async (slug: string): Promise<PageContent> => {
    try {
      // Try GitHub API first
      return await fetchPageFromGitHub(slug)
    } catch (error) {
      // Fallback to local content
      console.warn(`⚠️ GitHub API failed for page "${slug}", using local content`)
      return await fetchPageFromLocal(slug)
    }
  }

  // Fetch all pages with fallback
  const fetchAllPages = async (): Promise<PageContent[]> => {
    try {
      // Try GitHub API first
      return await fetchAllPagesFromGitHub()
    } catch (error) {
      // Fallback to local content
      console.warn('⚠️ GitHub API failed for pages, using local content')
      return await fetchAllPagesFromLocal()
    }
  }

  return {
    fetchPageFromGitHub,
    fetchAllPagesFromGitHub,
    fetchPageFromLocal,
    fetchAllPagesFromLocal,
    fetchPage,
    fetchAllPages
  }
}