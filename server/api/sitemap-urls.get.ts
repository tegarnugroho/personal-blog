import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event).public
  const posts = await serverQueryContent(event, 'posts')
    .where({ _draft: { $ne: true } })
    .only(['_path', 'date', 'tags'])
    .find()

  const paths = new Set<string>(['/', '/about', '/search'])
  const tags = new Set<string>()
  for (const p of posts) {
    if (p?._path) paths.add(p._path)
    for (const t of (p.tags || [])) tags.add(String(t))
  }
  for (const t of tags) paths.add(`/tags/${encodeURIComponent(t)}`)

  // @nuxtjs/sitemap expects route strings or objects
  return Array.from(paths)
})

