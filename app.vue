<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  
</template>

<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

const config = useRuntimeConfig().public
const { siteConfig } = useSiteConfigShared()

useSeoMeta({
  titleTemplate: (chunk) => chunk ? `${chunk} · ${siteConfig.value?.title || config.siteTitle}` : (siteConfig.value?.title || config.siteTitle),
  ogSiteName: siteConfig.value?.title || config.siteTitle,
  description: siteConfig.value?.description || config.siteDescription,
  ogDescription: siteConfig.value?.description || config.siteDescription,
})
</script>

