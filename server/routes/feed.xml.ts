import { serverQueryContent } from '#content/server'

// Function to fetch site config from GitHub API (server-side)
const fetchSiteConfigFromGitHub = async () => {
  try {
    const fileResponse = await $fetch(
      'https://api.github.com/repos/tegarnugroho/personal-blog/contents/content/config/site.json',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'personal-blog'
        }
      }
    ) as any

    if (!fileResponse || !fileResponse.download_url) {
      throw new Error('Site config not found on GitHub')
    }

    const content = await $fetch(fileResponse.download_url) as string
    return JSON.parse(content)
  } catch (error) {
    console.warn('Failed to fetch site config from GitHub for RSS feed, using defaults')
    return null
  }
}

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event).public
  const siteUrl = cfg.siteUrl || 'http://localhost:3000'
  
  // Try to get site config from GitHub, fallback to runtime config
  const siteConfig = await fetchSiteConfigFromGitHub()
  const title = siteConfig?.title || cfg.siteTitle || 'My Blog'
  const description = siteConfig?.description || cfg.siteDescription || ''

  const items = await serverQueryContent(event, 'posts')
    .where({ _draft: { $ne: true } })
    .sort({ date: -1 })
    .limit(30)
    .find()

  const escaped = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const feedItems = items.map((p: any) => `
    <item>
      <title>${escaped(p.title || '')}</title>
      <link>${siteUrl}${p._path}</link>
      <guid>${siteUrl}${p._path}</guid>
      <pubDate>${p.date ? new Date(p.date).toUTCString() : ''}</pubDate>
      <description><![CDATA[${p.excerpt || ''}]]></description>
    </item>
  `).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>${escaped(title)}</title>
      <link>${siteUrl}</link>
      <description>${escaped(description)}</description>
      ${feedItems}
    </channel>
  </rss>`

  setHeader(event, 'Content-Type', 'application/rss+xml; charset=UTF-8')
  return xml
})

