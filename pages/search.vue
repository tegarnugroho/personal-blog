<template>
  <section>
    <h1 class="text-2xl font-bold mb-4">Search</h1>
    <input v-model="q" type="search" placeholder="Search posts..." class="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent" />
    <div class="mt-6 grid gap-6">
      <PostCard v-for="post in results" :key="post._path" :post="post" />
    </div>
    <p v-if="q && !results.length" class="mt-4 text-slate-500">No results</p>
  </section>
</template>

<script setup lang="ts">
import Fuse from 'fuse.js'

const { data: index } = await useFetch('/api/search')
const q = ref('')
const fuse = computed(() => new Fuse(index.value || [], { keys: ['title', 'excerpt', 'tags'], threshold: 0.35 }))
const results = computed(() => {
  if (!q.value) return index.value || []
  return fuse.value.search(q.value).map(r => r.item)
})

useSeoMeta({ title: 'Search' })
</script>

