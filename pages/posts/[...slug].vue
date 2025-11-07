<template>
  <article v-if="post" class="prose dark:prose-invert max-w-none">
    <h1>{{ post.title }}</h1>
    <p class="not-prose text-sm text-slate-500">
      <time :datetime="post.date">{{ formattedDate }}</time>
      <span v-if="post.readingTime"> • {{ post.readingTime.text }}</span>
    </p>
    <img v-if="post.hero" :src="post.hero" :alt="post.title" class="rounded-md w-full my-4" />
    <ContentRenderer :value="post" />

    <div class="not-prose mt-8 flex items-center justify-between">
      <TagList :tags="post.tags || []" />
      <ShareButtons :title="post.title" :url="canonicalUrl" />
    </div>
  </article>
  <div v-else>
    <p>Post not found.</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig().public
const { data: post } = await useAsyncData(`post:${route.path}`,
  () => queryContent('/posts').where({ _path: route.path }).findOne()
)

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

