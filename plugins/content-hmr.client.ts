export default defineNuxtPlugin(() => {
  if (import.meta.hot) {
    // Refresh site settings when any config file changes
    const configModules = import.meta.glob('~/content/config/**/*.{json,yaml,yml}', { eager: false })
    const configDeps = Object.keys(configModules)
    if (configDeps.length) {
      import.meta.hot.accept(configDeps, () => {
        refreshNuxtData('site-config')
      })
    }

    // Watch post content files and refresh relevant async data keys
    const postModules = import.meta.glob('~/content/posts/**/*.{md,markdown,json,yaml,yml}', { eager: false })
    const deps = Object.keys(postModules)
    if (deps.length) {
      import.meta.hot.accept(deps, () => {
        // Home list, tag lists, and post detail pages
        refreshNuxtData((key) => key === 'home-posts' || key.startsWith('tag:') || key.startsWith('post:'))
      })
    }
  }
})
