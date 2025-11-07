<template>
  <div class="flex items-center justify-center gap-2">
    <button class="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50" :disabled="page<=1" @click="$emit('update:page', page-1)">Prev</button>
    <span class="text-sm">Page {{ page }} of {{ totalPages }}</span>
    <button class="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50" :disabled="page>=totalPages" @click="$emit('update:page', page+1)">Next</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ page: number; totalPages: number }>()
defineEmits(['update:page'])
</script>

