<template>
  <div class="text-center py-16">
    <p class="text-lg">Redirecting to About…</p>
    <p class="mt-2"><a class="underline" href="https://hi-tegar.web.app/#about">Click here if not redirected</a></p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      if (process.client) {
        window.location.href = 'https://hi-tegar.web.app/#about'
      }
    }
  ]
})
</script>
