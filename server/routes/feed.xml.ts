import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event).public
  const siteUrl = cfg.siteUrl || 'http://localhost:3000'
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
      <title>${escaped(cfg.siteTitle || 'My Blog')}</title>
      <link>${siteUrl}</link>
      <description>${escaped(cfg.siteDescription || '')}</description>
      ${feedItems}
    </channel>
  </rss>`

  setHeader(event, 'Content-Type', 'application/rss+xml; charset=UTF-8')
  return xml
})

