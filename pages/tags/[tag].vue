<template>
  <section>
    <h1 class="text-2xl font-bold mb-6">Tag: #{{ tag }}</h1>
    <div class="grid gap-6">
      <PostCard v-for="post in posts" :key="post._path" :post="post" />
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const tag = computed(() => route.params.tag as string)
const { data: posts } = await useAsyncData(`tag:${tag.value}`, () =>
  queryContent('/posts')
    .where({ tags: { $contains: tag.value }, _draft: { $ne: true } })
    .only(['_path', 'title', 'excerpt', 'date', 'tags', 'hero', 'readingTime', 'body'])
    .sort({ date: -1 })
    .find()
)

useSeoMeta({ title: () => `Tag: ${tag.value}` })
</script>

