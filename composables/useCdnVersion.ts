export const useCdnVersion = () => {
  const version = useState<string>('cdn-version', () => '')

  const load = async () => {
    if (version.value) return version.value
    try {
      const data = await $fetch<any>('https://api.github.com/repos/tegarnugroho/personal-blog/commits/main', {
        headers: { Accept: 'application/vnd.github+json' }
      })
      version.value = data?.sha || 'main'
    } catch {
      version.value = 'main'
    }
    return version.value
  }

  return { version, load }
}

