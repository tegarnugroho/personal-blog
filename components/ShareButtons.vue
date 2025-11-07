<template>
  <div class="flex items-center gap-3 text-sm">
    <a :href="twitterUrl" target="_blank" rel="noopener" class="underline">Twitter/X</a>
    <a :href="linkedinUrl" target="_blank" rel="noopener" class="underline">LinkedIn</a>
    <a :href="mailtoUrl" class="underline">Email</a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; url: string }>()
const text = computed(() => encodeURIComponent(props.title))
const u = computed(() => encodeURIComponent(props.url))
const twitterUrl = computed(() => `https://twitter.com/intent/tweet?text=${text.value}&url=${u.value}`)
const linkedinUrl = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${u.value}`)
const mailtoUrl = computed(() => `mailto:?subject=${text.value}&body=${u.value}`)
</script>

