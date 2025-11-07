<template>
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur border-b border-black/10 dark:border-white/10 supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/70 transition-colors">
    <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
      <NuxtLink to="/" class="font-semibold tracking-wide rounded px-2 py-1 -mx-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white">
        {{ siteConfig?.title || defaultTitle }}
      </NuxtLink>
      <nav class="hidden sm:flex items-center gap-8 text-sm">
        <NuxtLink to="/" class="relative inline-block py-1 px-1 -mx-1 transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white after:content-[''] after:absolute after:left-1 after:right-1 after:bottom-0 after:h-px after:bg-current after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform">Home</NuxtLink>
        <NuxtLink to="/tags/javascript" class="relative inline-block py-1 px-1 -mx-1 transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white after:content-[''] after:absolute after:left-1 after:right-1 after:bottom-0 after:h-px after:bg-current after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform">Tags</NuxtLink>
        <NuxtLink to="/about" class="relative inline-block py-1 px-1 -mx-1 transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white after:content-[''] after:absolute after:left-1 after:right-1 after:bottom-0 after:h-px after:bg-current after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform">About</NuxtLink>
        <NuxtLink to="/search" class="relative inline-block py-1 px-1 -mx-1 transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white after:content-[''] after:absolute after:left-1 after:right-1 after:bottom-0 after:h-px after:bg-current after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform">Search</NuxtLink>
      </nav>
      <div class="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { siteConfig } = useSiteConfigShared()
const defaultTitle = useRuntimeConfig().public.siteTitle
</script>
