<template>
  <footer class="border-t border-black/10 dark:border-white/10">
    <div class="max-w-5xl mx-auto px-4 py-8 text-sm text-black/70 dark:text-white/70 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        © {{ new Date().getFullYear() }} {{ siteConfig?.author || 'Your Name' }} · Built with Nuxt + Decap CMS
      </div>
      <div class="flex items-center gap-3">
        <a href="/feed.xml" class="hover:underline">RSS</a>
        <a href="https://github.com" target="_blank" rel="noopener" class="hover:underline">GitHub</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { siteConfig } = useSiteConfigShared()
</script>
