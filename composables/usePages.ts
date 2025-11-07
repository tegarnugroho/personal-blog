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

  const fetchPage = async (slug: string): Promise<PageContent> => fetchPageFromLocal(slug)
  const fetchAllPages = async (): Promise<PageContent[]> => fetchAllPagesFromLocal()

  return { fetchPageFromLocal, fetchAllPagesFromLocal, fetchPage, fetchAllPages }
}

