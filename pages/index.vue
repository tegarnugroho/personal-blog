<template>
  <section>
    <h1 class="text-3xl font-bold mb-6">Latest Posts</h1>
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
const { data: posts } = await useAsyncData('home-posts', () =>
  queryContent('/posts')
    .where({ _draft: { $ne: true } })
    .only(['_path', 'title', 'excerpt', 'date', 'tags', 'hero', 'readingTime', 'body'])
    .sort({ date: -1 })
    .find()
)

const page = ref(Number(route.query.page || 1))
watch(() => route.query.page, (p) => page.value = Number(p || 1))
const totalPages = computed(() => Math.max(1, Math.ceil((posts.value?.length || 0) / PAGE_SIZE)))
const pagedPosts = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return (posts.value || []).slice(start, start + PAGE_SIZE)
})

useSeoMeta({ title: 'Home' })
</script>

