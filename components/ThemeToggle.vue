<template>
  <button
    class="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
    @click="toggle"
    :aria-label="`Toggle ${colorMode.value} mode`"
  >
    <span v-if="colorMode.value === 'dark'">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const toggle = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

