import type { PageContent } from '~/types'

export const usePages = () => {
  const fetchPageFromLocal = async (slug: string): Promise<PageContent> => {
    const localPage = await queryContent('/pages').where({ _path: `/pages/${slug}` }).findOne()
    if (!localPage) throw new Error(`Page "${slug}" not found`)
    return {
      _path: localPage._path || `/pages/${slug}`,
      title: localPage.title || slug.charAt(0).toUpperCase() + slug.slice(1),
      body: typeof localPage.body === 'string' ? localPage.body : '',
      _source: 'local'
    }
  }

  const fetchPageFromCdn = async (slug: string): Promise<PageContent> => {
    const url = `https://cdn.jsdelivr.net/gh/tegarnugroho/personal-blog@main/content/pages/${slug}.md`
    const content = await $fetch<string>(url)
    const fm = /^---\n([\s\S]*?)\n---/m.exec(content)
    const front: Record<string, any> = {}
    if (fm) {
      fm[1].split('\n').forEach((line: string) => {
        const i = line.indexOf(':')
        if (i > 0) {
          const key = line.slice(0, i).trim()
          const val = line.slice(i + 1).trim().replace(/^['\"]|['\"]$/g, '')
          front[key] = val
        }
      })
    }
    const body = fm ? content.slice(fm[0].length).trim() : content
    return { _path: `/pages/${slug}`, title: front.title || slug, body, _source: 'cdn' }
  }

  const fetchAllPagesFromLocal = async (): Promise<PageContent[]> => {
    const localPages = await queryContent('/pages')
      .only(['_path', 'title', 'body'])
      .find()
    return localPages.map((page: any) => ({
      _path: page._path,
      title: page.title,
      body: page.body || '',
      _source: 'local' as const
    })) as PageContent[]
  }

  const fetchPage = async (slug: string): Promise<PageContent> => {
    try {
      return await fetchPageFromLocal(slug)
    } catch {
      if (typeof window !== 'undefined') {
        return await fetchPageFromCdn(slug)
      }
      throw new Error(`Page \"${slug}\" not found`)
    }
  }
  const fetchAllPages = async (): Promise<PageContent[]> => fetchAllPagesFromLocal()

  return { fetchPageFromLocal, fetchAllPagesFromLocal, fetchPage, fetchAllPages }
}
