<template>
  <section>
    <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8">Latest Posts</h1>
    
    <div v-if="error" class="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200">
      ⚠️ {{ error }}
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
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
const error = ref<string | null>(null)
const { fetchPosts } = usePosts()

// Main data fetching (local content)
const { data: posts } = await useAsyncData('home-posts', async () => {
  try {
    return await fetchPosts()
  } catch (err: any) {
    error.value = `Failed to fetch posts: ${err.message}`
    return []
  }
})

// Try to fetch CDN manifest for ordering/freshness (no token, client-side)
const cdnUrl = 'https://cdn.jsdelivr.net/gh/tegarnugroho/personal-blog@main/content/posts/index.json'
const { data: manifest } = await useFetch<any[]>(cdnUrl, { key: 'posts-index', server: false, default: () => [] })

// Pagination
const page = ref(Number(route.query.page || 1))
watch(() => route.query.page, (p: any) => page.value = Number(p || 1))

const totalPages = computed(() => Math.max(1, Math.ceil((posts.value?.length || 0) / PAGE_SIZE)))
const displayed = computed(() => {
  const local = posts.value || []
  const idx = (manifest.value || [])
  if (!idx.length) return local
  const mapBySlug = new Map(local.map((p: any) => [p._path?.split('/').pop(), p]))
  return idx.map((i: any) => {
    const p = mapBySlug.get(i.slug)
    return p || { _path: `/posts/${i.slug}`, title: i.title, tags: [], body: '' }
  })
})

const pagedPosts = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return displayed.value.slice(start, start + PAGE_SIZE)
})

useSeoMeta({ title: 'Home' })
</script>
