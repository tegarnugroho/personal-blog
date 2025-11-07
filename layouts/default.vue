<template>
  <div class="min-h-screen flex flex-col">
    <SiteHeader />
    <main class="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
  
</template>

<script setup lang="ts">
// Layout wrapper with header/footer
</script>

