<template>
  <footer class="border-t border-slate-200 dark:border-slate-800">
    <div class="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        © {{ new Date().getFullYear() }} {{ site?.author || 'Your Name' }} · Built with Nuxt + Decap CMS
      </div>
      <div class="flex items-center gap-3">
        <a href="/feed.xml" class="hover:underline">RSS</a>
        <a href="https://github.com" target="_blank" rel="noopener" class="hover:underline">GitHub</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { data: site } = await useAsyncData('site-config', () => queryContent('/config').findOne())
</script>

