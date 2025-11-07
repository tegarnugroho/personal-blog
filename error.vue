<template>
  <div class="flex flex-col items-center justify-center text-center py-24">
    <h1 class="text-6xl font-bold mb-4">{{ error?.statusCode || 404 }}</h1>
    <p class="text-slate-500 mb-6">{{ error?.message || 'Page not found' }}</p>
    <NuxtLink to="/" class="underline">Go home</NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{ error?: { statusCode?: number; message?: string } }>()
</script>

