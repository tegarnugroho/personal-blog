<template>
  <article v-if="post" class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="!mb-2 text-3xl sm:text-4xl font-extrabold tracking-tight">{{ post.title }}</h1>
    <p class="not-prose text-sm text-slate-500 dark:text-slate-400">
      <time :datetime="post.date">{{ formattedDate }}</time>
      <span v-if="post.readingTime"> · {{ post.readingTime.text || `${post.readingTime.minutes} min read` }}</span>
    </p>
    <img v-if="post.hero" :src="post.hero" :alt="post.title" class="rounded-md w-full my-4" />
    <ContentRenderer v-if="post._source !== 'cdn'" :value="post" />
    <div v-else class="prose dark:prose-invert" v-html="renderedContent"></div>

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
const slug = computed(() => route.path.split('/').pop() || '')

const { data: post } = await useAsyncData(`post:${route.path}`, async (): Promise<Post | null> => {
  // Try local first
  const localPost = await queryContent('/posts').where({ _path: route.path }).findOne()
  if (localPost) {
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
  }

  // Fallback to CDN raw markdown (jsDelivr)
  if (!slug.value) return null
  const cdnUrl = `https://cdn.jsdelivr.net/gh/tegarnugroho/personal-blog@main/content/posts/${slug.value}.md`
  try {
    const content = await $fetch<string>(cdnUrl)
    // Parse frontmatter
    const fm = /^---\n([\s\S]*?)\n---/m.exec(content)
    const front: Record<string, any> = {}
    if (fm) {
      fm[1].split('\n').forEach((line: string) => {
        const i = line.indexOf(':')
        if (i > 0) {
          const key = line.slice(0, i).trim()
          const val = line.slice(i + 1).trim().replace(/^['\"]|['\"]$/g, '')
          if (val.startsWith('[') && val.endsWith(']')) {
            front[key] = val.slice(1, -1).split(',').map(v => v.trim().replace(/['\"]/g, '')).filter(Boolean)
          } else if (val === 'true' || val === 'false') {
            front[key] = val === 'true'
          } else {
            front[key] = val
          }
        }
      })
    }
    const body = fm ? content.slice(fm[0].length).trim() : content
    const words = body.split(/\s+/).filter(Boolean).length
    return {
      _path: route.path,
      title: front.title || slug.value,
      date: front.date || new Date().toISOString(),
      excerpt: front.excerpt,
      tags: front.tags || [],
      hero: front.hero,
      _draft: front._draft || false,
      body,
      readingTime: { minutes: Math.max(1, Math.ceil(words / 200)), text: `${Math.max(1, Math.ceil(words / 200))} min read` },
      _source: 'cdn'
    }
  } catch (e) {
    console.error('Failed to fetch CDN post:', e)
    return null
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

// Basic markdown → HTML for CDN fallback
const renderedContent = computed(() => {
  if (!post.value || post.value._source !== 'cdn') return ''
  let html = post.value.body
  if (typeof html !== 'string') return ''
  // Images ![alt](src)
  html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, (m, alt, src) => `<img src="${src}" alt="${alt}" class="rounded-md my-4 max-w-full" />`)
  // Headers
  html = html.replace(/^### (.*)$/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*)$/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*)$/gim, '<h1>$1</h1>')
  // Bold / Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/gim, '<pre><code class="language-$1">$2</code></pre>')
  // Inline code
  html = html.replace(/`([^`]*)`/gim, '<code>$1</code>')
  // Links [text](url)
  html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  // Lists
  html = html.replace(/^(?:\*|-) (.*)$/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)(?![\s\S]*<li>)/s, '<ul>$1</ul>')
  // Line breaks
  html = html.replace(/\n/g, '<br>')
  return html
})
</script>
