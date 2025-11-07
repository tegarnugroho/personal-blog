<template>
  <header class="border-b border-slate-200 dark:border-slate-800">
    <div class="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
      <NuxtLink to="/" class="font-semibold text-lg hover:opacity-80">
        {{ siteConfig?.title || defaultTitle }}
      </NuxtLink>
      <nav class="flex items-center gap-4 text-sm">
        <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
        <NuxtLink to="/tags/javascript" class="hover:underline">Tags</NuxtLink>
        <NuxtLink to="/about" class="hover:underline">About</NuxtLink>
        <NuxtLink to="/search" class="hover:underline">Search</NuxtLink>
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { siteConfig } = useSiteConfigShared()
const defaultTitle = useRuntimeConfig().public.siteTitle
</script>

