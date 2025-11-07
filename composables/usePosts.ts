interface Post {
  _path: string
  title: string
  date: string
  excerpt?: string
  tags: string[]
  hero?: string
  _draft?: boolean
  body: string
  readingTime?: {
    minutes: number
    text?: string
  }
  _source?: 'github' | 'local'
}

interface GitHubFile {
  name: string
  download_url: string
  sha: string
  type: string
}

export const usePosts = () => {
  // Function to fetch posts from GitHub API
  const fetchFromGitHub = async (): Promise<Post[]> => {
    try {
      console.log('🔄 Fetching posts from GitHub API...')
      
      // Fetch file list from GitHub
      const filesResponse = await $fetch('https://api.github.com/repos/tegarnugroho/personal-blog/contents/content/posts', {
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

      console.log(`📄 Found ${markdownFiles.length} markdown files on GitHub`)

      // Fetch content for each file
      const posts = await Promise.all(
        markdownFiles.map(async (file: GitHubFile): Promise<Post | null> => {
          try {
            const content = await $fetch(file.download_url) as string
            
            // Parse frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
            const frontmatter: any = {}
            
            if (frontmatterMatch) {
              frontmatterMatch[1].split('\n').forEach((line: string) => {
                const colonIndex = line.indexOf(':')
                if (colonIndex > 0) {
                  const key = line.substring(0, colonIndex).trim()
                  const value = line.substring(colonIndex + 1).trim()
                  
                  // Parse different types
                  if (value.startsWith('[') && value.endsWith(']')) {
                    // Array (tags)
                    frontmatter[key] = value
                      .slice(1, -1)
                      .split(',')
                      .map((v: string) => v.trim().replace(/['"]/g, ''))
                      .filter((v: string) => v)
                  } else if (value === 'true' || value === 'false') {
                    // Boolean
                    frontmatter[key] = value === 'true'
                  } else {
                    // String (remove quotes)
                    frontmatter[key] = value.replace(/^["']|["']$/g, '')
                  }
                }
              })
            }

            // Extract body content
            const body = frontmatterMatch 
              ? content.slice(frontmatterMatch[0].length).trim()
              : content

            const post: Post = {
              _path: `/posts/${file.name.replace('.md', '')}`,
              title: frontmatter.title || 'Untitled',
              date: frontmatter.date || new Date().toISOString(),
              excerpt: frontmatter.excerpt,
              tags: frontmatter.tags || [],
              hero: frontmatter.hero,
              _draft: frontmatter._draft || false,
              body,
              readingTime: { minutes: Math.ceil(body.split(' ').length / 200) },
              _source: 'github'
            }

            return post
          } catch (error) {
            console.error(`Error processing ${file.name}:`, error)
            return null
          }
        })
      )

      // Filter valid posts and exclude drafts
      const validPosts = posts
        .filter((post): post is Post => post !== null && !post._draft)
        .sort((a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime())

      console.log(`✅ Successfully fetched ${validPosts.length} posts from GitHub`)
      return validPosts

    } catch (err: any) {
      console.error('❌ GitHub API error:', err)
      throw err
    }
  }

  // Function to fetch from local content
  const fetchFromLocal = async (): Promise<Post[]> => {
    const localPosts = await queryContent('/posts')
      .where({ _draft: { $ne: true } })
      .only(['_path', 'title', 'excerpt', 'date', 'tags', 'hero', 'readingTime', 'body'])
      .sort({ date: -1 })
      .find()
    
    console.log(`📁 Using local content: ${localPosts.length} posts`)
    return localPosts.map((post: any) => ({ 
      ...post, 
      _source: 'local' as const,
      tags: post.tags || [],
      body: post.body || '',
      readingTime: post.readingTime || { minutes: 1 }
    })) as Post[]
  }

  // Fetch with fallback
  const fetchPosts = async (): Promise<Post[]> => {
    try {
      // Try GitHub API first
      return await fetchFromGitHub()
    } catch (error) {
      // Fallback to local content
      console.warn('⚠️ GitHub API failed, using local content')
      return await fetchFromLocal()
    }
  }

  return {
    fetchFromGitHub,
    fetchFromLocal,
    fetchPosts
  }
}

export type { Post, GitHubFile }