<template>
  <article v-if="pageContent" class="prose dark:prose-invert max-w-none">
    <h1>{{ pageContent.title }}</h1>
    <ContentRenderer v-if="pageContent._source !== 'cdn'" :value="pageContent" />
    <div v-else v-html="renderedContent"></div>
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

const { fetchPage } = usePages()
const error = ref<string | null>(null)

// Fetch page content (local first, CDN fallback on client)
const { data: pageContent } = await useAsyncData('about-page', async (): Promise<PageContent | null> => {
  try {
    return await fetchPage('about')
  } catch (error) {
    console.error('Failed to fetch about page:', error)
    return null
  }
})

// Simple renderer for CDN markdown
const renderedContent = computed(() => {
  if (!pageContent.value || pageContent.value._source !== 'cdn') return ''
  let html = pageContent.value.body
  if (typeof html !== 'string') return ''
  html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, (m, alt, src) => `<img src="${src}" alt="${alt}" class="rounded-md my-4 max-w-full" />`)
  html = html.replace(/^### (.*)$/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*)$/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*)$/gim, '<h1>$1</h1>')
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/gim, '<pre><code class="language-$1">$2</code></pre>')
  html = html.replace(/`([^`]*)`/gim, '<code>$1</code>')
  html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  html = html.replace(/^(?:\*|-) (.*)$/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)(?![\s\S]*<li>)/s, '<ul>$1</ul>')
  html = html.replace(/\n/g, '<br>')
  return html
})

// SEO Meta
useSeoMeta({ 
  title: pageContent.value?.title || 'About',
  description: 'About page'
})
</script>
