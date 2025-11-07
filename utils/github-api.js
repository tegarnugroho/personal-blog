// Simple GitHub API utility for fetching posts
export const fetchPostsFromGitHub = async () => {
  try {
    console.log('🔄 Fetching posts from GitHub API...')
    
    // Step 1: Get list of files
    const filesResponse = await fetch(
      'https://api.github.com/repos/tegarnugroho/personal-blog/contents/content/posts',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'personal-blog'
        }
      }
    )

    if (!filesResponse.ok) {
      throw new Error(`GitHub API error: ${filesResponse.status}`)
    }

    const files = await filesResponse.json()
    
    // Step 2: Filter markdown files
    const markdownFiles = files.filter(file => 
      file.name.endsWith('.md') && file.type === 'file'
    )

    console.log(`📄 Found ${markdownFiles.length} markdown files`)

    // Step 3: Fetch content for each file
    const posts = await Promise.all(
      markdownFiles.map(async (file) => {
        try {
          const contentResponse = await fetch(file.download_url)
          const content = await contentResponse.text()
          
          // Simple frontmatter parsing
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
          const frontmatter = {}
          
          if (frontmatterMatch) {
            frontmatterMatch[1].split('\n').forEach(line => {
              const [key, ...valueParts] = line.split(':')
              if (key && valueParts.length) {
                const value = valueParts.join(':').trim()
                // Simple parsing - remove quotes and brackets
                frontmatter[key.trim()] = value.replace(/^["'\[]|["'\]]$/g, '')
              }
            })
          }

          return {
            slug: file.name.replace('.md', ''),
            filename: file.name,
            githubSha: file.sha,
            lastModified: file.sha,
            ...frontmatter,
            content: frontmatterMatch ? content.slice(frontmatterMatch[0].length).trim() : content,
            source: 'github-api'
          }
        } catch (error) {
          console.error(`Error fetching ${file.name}:`, error)
          return null
        }
      })
    )

    // Filter successful requests
    const validPosts = posts
      .filter(post => post !== null)
      .filter(post => !post._draft) // Exclude drafts
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())

    console.log(`✅ Successfully fetched ${validPosts.length} posts from GitHub`)
    return validPosts

  } catch (error) {
    console.error('❌ GitHub API fetch failed:', error)
    throw error
  }
}

// Test function - bisa dipanggil dari browser console
if (typeof window !== 'undefined') {
  window.testGitHubAPI = fetchPostsFromGitHub
}