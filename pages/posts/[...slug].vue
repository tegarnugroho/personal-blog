<template>
  <article v-if="post" class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="!mb-2 text-3xl sm:text-4xl font-extrabold tracking-tight">{{ post.title }}</h1>
    <p class="not-prose text-sm text-slate-500 dark:text-slate-400">
      <time :datetime="post.date">{{ formattedDate }}</time>
      <span v-if="post.readingTime"> · {{ post.readingTime.text || `${post.readingTime.minutes} min read` }}</span>
    </p>
    <img v-if="post.hero" :src="post.hero" :alt="post.title" class="rounded-md w-full my-4" />
    <ContentRenderer :value="post" />

    <div class="not-prose mt-10 flex items-center justify-between">
      <TagList :tags="post.tags || []" />
      <ShareButtons :title="post.title" :url="canonicalUrl" />
    </div>
  </article>
  <div v-else class="text-center py-8">
    <p>Post not found.</p>
    <NuxtLink to="/" class="text-blue-500 hover:text-blue-600">← Back to Home</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types'

const route = useRoute()
const config = useRuntimeConfig().public

const { data: post } = await useAsyncData(`post:${route.path}`, async (): Promise<Post | null> => {
  const localPost = await queryContent('/posts').where({ _path: route.path }).findOne()
  if (!localPost) return null
  return {
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
})

const formattedDate = computed(() => post.value?.date ? new Date(post.value.date).toLocaleDateString() : '')
const canonicalUrl = computed(() => `${config.siteUrl}${route.fullPath}`)

useSeoMeta({
  title: post.value?.title,
  description: post.value?.excerpt,
  ogTitle: post.value?.title,
  ogDescription: post.value?.excerpt,
  ogImage: post.value?.hero,
  twitterCard: 'summary_large_image'
})
</script>
