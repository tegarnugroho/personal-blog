<template>
  <div v-if="isLoading" class="fixed inset-0 z-[60] grid place-items-center bg-black/40 dark:bg-black/50 backdrop-blur-sm pointer-events-none">
    <div class="flex flex-col items-center gap-3 pointer-events-auto">
      <span class="block h-9 w-9 rounded-full border-2 border-white/30 border-t-white/90 dark:border-white/30 dark:border-t-white/90 animate-spin" />
      <span class="text-white/90 text-sm">Loading...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const isLoading = useState<boolean>('page-loading', () => false)
</script>

