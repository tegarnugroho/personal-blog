<template>
  <div class="min-h-screen flex flex-col font-sans">
    <SiteHeader />
    <main class="max-w-5xl mx-auto px-4 py-10 flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
  
</template>

<script setup lang="ts">
// Layout wrapper with header/footer
</script>
