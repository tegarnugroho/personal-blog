<template>
  <section>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Latest Posts</h1>
      <div class="flex items-center gap-2 text-sm">
        <span v-if="dataSource === 'github'" class="text-green-600 dark:text-green-400 flex items-center gap-1">
          🌐 Live from GitHub
        </span>
        <span v-else class="text-gray-600 dark:text-gray-400 flex items-center gap-1">
          📁 Local content
        </span>
        <button 
          @click="refreshFromGitHub" 
          :disabled="isRefreshing"
          class="px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 disabled:opacity-50"
        >
          {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
    </div>
    
    <div v-if="error" class="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200">
      ⚠️ {{ error }}
    </div>
    
    <div class="grid gap-6">
      <PostCard v-for="post in pagedPosts" :key="post._path" :post="post" />
    </div>
    
    <div class="mt-8" v-if="totalPages>1">
      <Pagination v-model:page="page" :total-pages="totalPages" />
    </div>
  </section>
</template>

<script setup lang="ts">
const PAGE_SIZE = 6
const route = useRoute()
const isRefreshing = ref(false)
const dataSource = ref<'github' | 'local'>('local')
const error = ref<string | null>(null)

// Function to fetch posts from GitHub API
const fetchFromGitHub = async () => {
  try {
    console.log('🔄 Fetching posts from GitHub API...')
    
    // Fetch file list from GitHub
    const filesResponse = await $fetch('https://api.github.com/repos/tegarnugroho/personal-blog/contents/content/posts', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'personal-blog'
      }
    })

    if (!Array.isArray(filesResponse)) {
      throw new Error('Invalid response from GitHub API')
    }

    // Filter markdown files
    const markdownFiles = filesResponse.filter((file: any) => 
      file.name.endsWith('.md') && file.type === 'file'
    )

    console.log(`📄 Found ${markdownFiles.length} markdown files on GitHub`)

    // Fetch content for each file
    const posts = await Promise.all(
      markdownFiles.map(async (file: any) => {
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
                    .map(v => v.trim().replace(/['"]/g, ''))
                    .filter(v => v)
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

          return {
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
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error)
          return null
        }
      })
    )

    // Filter valid posts and exclude drafts
    const validPosts = posts
      .filter(post => post !== null && !post._draft)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    console.log(`✅ Successfully fetched ${validPosts.length} posts from GitHub`)
    dataSource.value = 'github'
    error.value = null
    return validPosts

  } catch (err: any) {
    console.error('❌ GitHub API error:', err)
    error.value = `GitHub API failed: ${err.message}`
    throw err
  }
}

// Function to fetch from local content
const fetchFromLocal = async () => {
  const localPosts = await queryContent('/posts')
    .where({ _draft: { $ne: true } })
    .only(['_path', 'title', 'excerpt', 'date', 'tags', 'hero', 'readingTime', 'body'])
    .sort({ date: -1 })
    .find()
  
  dataSource.value = 'local'
  console.log(`📁 Using local content: ${localPosts.length} posts`)
  return localPosts.map(post => ({ ...post, _source: 'local' }))
}

// Main data fetching with fallback
const { data: posts, refresh } = await useAsyncData('home-posts', async () => {
  try {
    // Try GitHub API first
    return await fetchFromGitHub()
  } catch (error) {
    // Fallback to local content
    console.warn('⚠️ GitHub API failed, using local content')
    return await fetchFromLocal()
  }
})

// Pagination
const page = ref(Number(route.query.page || 1))
watch(() => route.query.page, (p) => page.value = Number(p || 1))

const totalPages = computed(() => Math.max(1, Math.ceil((posts.value?.length || 0) / PAGE_SIZE)))
const pagedPosts = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return (posts.value || []).slice(start, start + PAGE_SIZE)
})

// Manual refresh function
const refreshFromGitHub = async () => {
  isRefreshing.value = true
  try {
    await refresh()
  } finally {
    isRefreshing.value = false
  }
}

useSeoMeta({ title: 'Home' })
</script>

