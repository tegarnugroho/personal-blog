<template>
  <ul class="flex flex-wrap gap-2">
    <li v-for="tag in tags" :key="tag">
      <NuxtLink :to="`/tags/${encodeURIComponent(tag)}`" class="chip chip-s">
        #{{ tag }}
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{ tags: string[] }>()
</script>
