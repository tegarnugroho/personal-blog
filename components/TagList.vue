<template>
  <ul class="flex flex-wrap gap-2">
    <li v-for="tag in tags" :key="tag">
      <NuxtLink :to="`/tags/${encodeURIComponent(tag)}`" class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs hover:bg-slate-200 dark:hover:bg-slate-700">
        #{{ tag }}
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{ tags: string[] }>()
</script>

