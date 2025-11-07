<template>
  <article v-if="pageContent" class="prose dark:prose-invert max-w-none">
    <h1>{{ pageContent.title }}</h1>
    
    <!-- Render content based on source -->
    <ContentRenderer v-if="pageContent._source === 'local'" :value="pageContent" />
    <div v-else class="content-from-github" v-html="renderedContent"></div>
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
    <p>Page not found.</p>
    <NuxtLink to="/" class="text-blue-500 hover:text-blue-600">← Back to Home</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { PageContent } from '~/types'

const route = useRoute()
definePageMeta({ key: (route) => route.fullPath })
const { fetchPage } = usePages()
const error = ref<string | null>(null)

// Extract slug from route
const slug = computed(() => {
  const pathParts = route.path.split('/')
  return pathParts[pathParts.length - 1]
})

// Fetch page content with GitHub API fallback
const pageKey = computed(() => `page:${route.path}`)
const { data: pageContent } = await useAsyncData(pageKey, async (): Promise<PageContent | null> => {
  try {
    return await fetchPage(slug.value)
  } catch (err: any) {
    console.error(`Failed to fetch page "${slug.value}":`, err)
    error.value = `Failed to load page: ${err.message}`
    return null
  }
}, { watch: [() => route.path] })

// Simple markdown renderer for GitHub content
const renderedContent = computed(() => {
  if (!pageContent.value || pageContent.value._source === 'local') return ''
  
  const bodyContent = pageContent.value.body
  if (typeof bodyContent !== 'string') return ''
  
  // Basic markdown to HTML conversion
  let html = bodyContent
  
  // Convert relative image paths to GitHub raw URLs in markdown
  html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, (match, alt, src) => {
    const fullSrc = src.startsWith('http') 
      ? src 
      : `https://raw.githubusercontent.com/tegarnugroho/personal-blog/main/public${src}`
    return `<img src="${fullSrc}" alt="${alt}" class="rounded-md my-4 max-w-full" />`
  })
  
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
  title: pageContent.value?.title || 'Page',
  description: `${pageContent.value?.title || 'Page'} - Content page`
})
</script>
