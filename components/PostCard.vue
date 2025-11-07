<template>
  <article class="group card overflow-hidden hover:shadow-sm">
    <NuxtLink :to="post._path" class="block">
      <div v-if="post.hero" class="w-full aspect-[16/9] overflow-hidden">
        <img :src="post.hero" :alt="post.title" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]">
      </div>
      <div class="p-5">
        <div class="text-xs text-slate-500 flex items-center gap-2">
          <time :datetime="post.date">{{ formattedDate }}</time>
          <span v-if="hasReadingTime">•</span>
          <span v-if="hasReadingTime">{{ post.readingTime.text }}</span>
        </div>
        <h3 class="mt-2 text-xl font-semibold leading-snug group-hover:text-primary">{{ post.title }}</h3>
        <p v-if="post.excerpt" class="mt-2 text-slate-600 dark:text-slate-400">{{ post.excerpt }}</p>
        <TagList class="mt-3" :tags="post.tags || []" />
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{ post: any }>()

const formattedDate = computed(() => {
  if (!props.post?.date) return ''
  try {
    const d = new Date(props.post.date)
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' }).format(d)
  } catch {
    return ''
  }
})

const hasReadingTime = computed(() => Boolean(props.post?.readingTime?.text))
</script>
