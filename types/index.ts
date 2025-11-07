export interface Post {
  _path: string
  title: string
  date: string
  excerpt?: string
  tags: string[]
  hero?: string
  _draft?: boolean
  body: string
  readingTime?: {
    minutes: number
    text?: string
  }
  _source?: 'github' | 'local'
}

export interface GitHubFile {
  name: string
  download_url: string
  sha: string
  type: string
}

export interface SiteConfig {
  title: string
  description: string
  author: string
  primary: string
  _source?: 'github' | 'local' | 'fallback'
}

export interface PageContent {
  _path: string
  title: string
  body: string
  _source?: 'github' | 'local'
}

export interface GitHubPost extends Post {
  _source: 'github'
}