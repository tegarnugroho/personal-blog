<template>
  <article v-if="post" class="prose prose-lg dark:prose-invert max-w-none mx-auto">
    <div class="not-prose mb-4">
      <NuxtLink to="/" class="text-sm text-slate-500 dark:text-slate-400 hover:underline">← Back to Home</NuxtLink>
    </div>
    <h1 class="!mb-2 text-3xl sm:text-4xl font-extrabold tracking-tight">{{ post.title }}</h1>
    <p class="not-prose mt-1 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
      <time :datetime="post.date">{{ formattedDate }}</time>
      <span aria-hidden="true">•</span>
      <span v-if="post.readingTime">{{ post.readingTime.text || `${post.readingTime.minutes} min read` }}</span>
    </p>
    <figure v-if="post.hero" class="not-prose my-5">
      <div class="w-full aspect-[16/9] max-h-[560px] overflow-hidden rounded-lg shadow-sm">
        <img :src="post.hero" :alt="post.title" class="h-full w-full object-cover" />
      </div>
    </figure>
    <hr class="my-8" />
    <ContentDoc v-if="post._source !== 'cdn'" :path="route.path" />
    <div v-else v-html="renderedContent"></div>

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
definePageMeta({ key: (route) => route.fullPath })
const slug = computed(() => route.path.split('/').pop() || '')

const key = computed(() => `post:${route.path}`)
const { data: post } = await useAsyncData(key, async (): Promise<Post | null> => {
  if (!slug.value) return null
  // Local first for proper highlighting via <ContentDoc>
  const localPost = await queryContent('/posts').where({ _path: route.path }).findOne()
  const body = (localPost as any)?.body
  const hasLocal = Boolean(localPost) && (typeof body !== 'string' || body.trim() !== '')
  if (hasLocal) {
    return { ...(localPost as any), _path: (localPost as any)._path || route.path, _source: 'local' }
  }

  // Fallback to CDN (client only)
  if (process.client) {
    try {
      const { load: loadCdnVersion } = useCdnVersion()
      const v = await loadCdnVersion()
      const cdnUrl = `https://cdn.jsdelivr.net/gh/tegarnugroho/personal-blog@${v}/content/posts/${slug.value}.md`
      const content = await $fetch<string>(cdnUrl)
      const fm = /^---\n([\s\S]*?)\n---/m.exec(content)
      const front: Record<string, any> = {}
      if (fm) {
        fm[1].split('\n').forEach((line: string) => {
          const i = line.indexOf(':')
          if (i > 0) {
            const k = line.slice(0, i).trim()
            const val = line.slice(i + 1).trim().replace(/^['\"]|['\"]$/g, '')
            if (val.startsWith('[') && val.endsWith(']')) {
              front[k] = val.slice(1, -1).split(',').map(v => v.trim().replace(/['\"]/g, '')).filter(Boolean)
            } else if (val === 'true' || val === 'false') {
              front[k] = val === 'true'
            } else {
              front[k] = val
            }
          }
        })
      }
      const bodyStr = fm ? content.slice(fm[0].length).trim() : content
      const words = bodyStr.split(/\s+/).filter(Boolean).length
      return {
        _path: route.path,
        title: front.title || slug.value,
        date: front.date || new Date().toISOString(),
        excerpt: front.excerpt,
        tags: front.tags || [],
        hero: front.hero,
        _draft: front._draft || false,
        body: bodyStr,
        readingTime: { minutes: Math.max(1, Math.ceil(words / 200)), text: `${Math.max(1, Math.ceil(words / 200))} min read` },
        _source: 'cdn'
      }
    } catch (e) {
      console.warn('CDN fetch failed and no local content:', e)
    }
  }
  return null
}, { server: false, watch: [() => route.path] })

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

// Basic markdown -> HTML for CDN fallback (lightweight)
const renderedContent = computed(() => {
  if (!post.value || post.value._source !== 'cdn') return ''
  let html = post.value.body
  if (typeof html !== 'string') return ''
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, (m, alt, src) => `<img src="${src}" alt="${alt}" class="rounded-md my-4 max-w-full" />`)
  // Headings
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
  // Links
  html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  // Lists
  html = html.replace(/^(?:\*|-) (.*)$/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  // Line breaks
  html = html.replace(/\n/g, '<br>')
  return html
})
</script>


