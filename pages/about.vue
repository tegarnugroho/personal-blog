<template>
  <article v-if="pageContent" class="prose dark:prose-invert max-w-none">
    <h1>{{ pageContent.title }}</h1>
    <ContentRenderer :value="pageContent" />
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

// Fetch page content (local only)
const { data: pageContent } = await useAsyncData('about-page', async (): Promise<PageContent | null> => {
  try {
    return await fetchPage('about')
  } catch (error) {
    console.error('Failed to fetch about page:', error)
    return null
  }
})

// SEO Meta
useSeoMeta({ 
  title: pageContent.value?.title || 'About',
  description: 'About page'
})
</script>
