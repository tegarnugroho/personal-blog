import type { Post } from '~/types'

export const usePosts = () => {
  const fetchFromLocal = async (): Promise<Post[]> => {
    const localPosts = await queryContent('/posts')
      .where({ _draft: { $ne: true } })
      .only(['_path', 'title', 'excerpt', 'date', 'tags', 'hero', 'readingTime', 'body'])
      .sort({ date: -1 })
      .find()

    return localPosts.map((post: any) => ({
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

