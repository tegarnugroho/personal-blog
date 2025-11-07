---
title: Hello, Nuxt + Decap!
date: 2024-01-05
excerpt: A fresh start for my personal blog, powered by Nuxt 3, Tailwind, and Decap CMS.
tags:
  - nuxt
  - decap
  - jamstack
hero: /uploads/vscode-banner.png
---

Welcome to my blog! This site is built with **Nuxt 3** and **Tailwind CSS**, with content managed in Git via **Decap CMS** (formerly Netlify CMS).

```ts [pages/index.vue]
const { data: posts } = await useAsyncData('home-posts', () =>
  queryContent('/posts').sort({ date: -1 }).find()
)
```

Features:

- Markdown posts with syntax highlighting via Shiki
- Static site generation (SSG) for fast, free hosting
- Client-side search with Fuse.js
- Dark/light theme toggle and responsive design

Stay tuned for more posts about code, tools, and learning!
