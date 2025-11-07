import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const posts = await serverQueryContent(event, 'posts')
    .where({ _draft: { $ne: true } })
    .only(['_path', 'title', 'excerpt', 'date', 'tags', 'hero', 'readingTime'])
    .sort({ date: -1 })
    .find()

  return posts
})

