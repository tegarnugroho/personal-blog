import type { Post } from '~/types'

export const usePosts = () => {
  const fetchFromLocal = async (): Promise<Post[]> => {
    const localPosts = await queryContent('/posts')
      .where({ _draft: { $ne: true }, _path: { $ne: '/posts/index' } })
      .only(['_path', 'title', 'excerpt', 'date', 'tags', 'hero', 'readingTime', 'body'])
      .sort({ date: -1 })
      .find()
    // Exclude directory index docs like '/posts' and any nested paths not matching '/posts/{slug}'
    const filtered = (localPosts as any[]).filter(p => typeof p._path === 'string' && /^\/posts\/[^/]+$/.test(p._path))

    return filtered.map((post: any) => ({
      ...post,
      _source: 'local' as const,
      tags: post.tags || [],
      body: post.body || '',
      readingTime: post.readingTime || { minutes: 1 }
    })) as Post[]
  }

  const fetchPosts = async (): Promise<Post[]> => {
    return await fetchFromLocal()
  }

  return { fetchFromLocal, fetchPosts }
}

export type { Post }
