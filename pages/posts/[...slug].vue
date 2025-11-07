<template>
  <article v-if="post" class="prose dark:prose-invert max-w-none">
    <h1>{{ post.title }}</h1>
    <p class="not-prose text-sm text-slate-500">
      <time :datetime="post.date">{{ formattedDate }}</time>
      <span v-if="post.readingTime"> • {{ post.readingTime.text || `${post.readingTime.minutes} min read` }}</span>
    </p>
    <img v-if="post.hero" :src="post.hero" :alt="post.title" class="rounded-md w-full my-4" />
    
    <!-- Render content based on source -->
    <ContentRenderer v-if="post._source === 'local'" :value="post" />
    <div v-else class="content-from-github" v-html="renderedContent"></div>

    <div class="not-prose mt-8 flex items-center justify-between">
      <TagList :tags="post.tags || []" />
      <ShareButtons :title="post.title" :url="canonicalUrl" />
    </div>
  </article>
  <div v-else-if="error" class="text-center py-8">
    <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    <button 
      @click="$router.go(0)"
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Refresh Page
    </button>
  </div>
  <div v-else class="text-center py-8">
    <p>Post not found.</p>
    <NuxtLink to="/" class="text-blue-500 hover:text-blue-600">← Back to Home</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types'

const route = useRoute()
const config = useRuntimeConfig().public
const error = ref<string | null>(null)

// Extract slug from route
const slug = computed(() => {
  const pathParts = route.path.split('/')
  return pathParts[pathParts.length - 1]
})

// Function to fetch post from GitHub API
const fetchFromGitHub = async (): Promise<Post> => {
  try {
    console.log(`🔄 Fetching post "${slug.value}" from GitHub API...`)
    
    // Get the specific file from GitHub
    const fileName = `${slug.value}.md`
    const fileResponse = await $fetch(
      `https://api.github.com/repos/tegarnugroho/personal-blog/contents/content/posts/${fileName}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'personal-blog'
        }
      }
    ) as any

    if (!fileResponse || !fileResponse.download_url) {
      throw new Error('Post not found on GitHub')
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

    const post: Post = {
      _path: route.path,
      title: frontmatter.title || 'Untitled',
      date: frontmatter.date || new Date().toISOString(),
      excerpt: frontmatter.excerpt,
      tags: frontmatter.tags || [],
      hero: frontmatter.hero,
      _draft: frontmatter._draft || false,
      body,
      readingTime: { 
        minutes: Math.ceil(body.split(' ').length / 200),
        text: `${Math.ceil(body.split(' ').length / 200)} min read`
      },
      _source: 'github'
    }

    console.log(`✅ Successfully fetched post "${slug.value}" from GitHub`)
    error.value = null
    return post

  } catch (err: any) {
    console.error(`❌ GitHub API error for post "${slug.value}":`, err)
    error.value = `GitHub API failed: ${err.message}`
    throw err
  }
}

// Function to fetch from local content
const fetchFromLocal = async (): Promise<Post> => {
  const localPost = await queryContent('/posts').where({ _path: route.path }).findOne()
  if (!localPost) {
    throw new Error('Post not found locally')
  }
  
  console.log(`📁 Using local content for post "${slug.value}"`)
  
  // Convert to our Post type
  const post: Post = {
    _path: localPost._path || route.path,
    title: localPost.title || 'Untitled',
    date: localPost.date || new Date().toISOString(),
    excerpt: typeof localPost.excerpt === 'string' ? localPost.excerpt : undefined,
    tags: localPost.tags || [],
    hero: localPost.hero,
    _draft: localPost._draft || false,
    body: typeof localPost.body === 'string' ? localPost.body : '',
    readingTime: localPost.readingTime || { minutes: 1 },
    _source: 'local'
  }
  
  return post
}

// Main data fetching with fallback
const { data: post } = await useAsyncData(`post:${route.path}`, async (): Promise<Post | null> => {
  try {
    // Try GitHub API first
    return await fetchFromGitHub()
  } catch (error) {
    // Fallback to local content
    console.warn(`⚠️ GitHub API failed for post "${slug.value}", using local content`)
    try {
      return await fetchFromLocal()
    } catch (localError) {
      console.error('❌ Both GitHub and local failed:', localError)
      return null
    }
  }
})

// Computed properties
const formattedDate = computed(() => {
  if (!post.value?.date) return ''
  return new Date(post.value.date).toLocaleDateString()
})

const canonicalUrl = computed(() => `${config.siteUrl}${route.fullPath}`)

// Simple markdown renderer for GitHub content
const renderedContent = computed(() => {
  if (!post.value || post.value._source === 'local') return ''
  
  const bodyContent = post.value.body
  if (typeof bodyContent !== 'string') return ''
  
  // Basic markdown to HTML conversion
  let html = bodyContent
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
  
  // Italic
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>')
  
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/gim, '<pre><code class="language-$1">$2</code></pre>')
  
  // Inline code
  html = html.replace(/`([^`]*)`/gim, '<code>$1</code>')
  
  // Links
  html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  
  // Line breaks
  html = html.replace(/\n/gim, '<br>')
  
  // Lists
  html = html.replace(/^\* (.*)$/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  return html
})

// SEO Meta
useSeoMeta({
  title: post.value?.title,
  description: post.value?.excerpt,
  ogTitle: post.value?.title,
  ogDescription: post.value?.excerpt,
  ogImage: post.value?.hero,
  twitterCard: 'summary_large_image'
})
</script>

