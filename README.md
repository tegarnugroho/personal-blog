# Nuxt 3 Blog + Decap CMS

Free, Git-based personal blog built with Nuxt 3, Tailwind CSS, and Decap CMS. Static site generation makes it ideal for Cloudflare Pages or Netlify free tiers.

## Features

- Nuxt 3 + Tailwind CSS (dark/light mode)
- Markdown posts via @nuxt/content with Shiki highlighting
- SEO-friendly meta, sitemap, and RSS feed
- Tags, reading time, featured images
- Client-side search (Fuse.js)
- Decap CMS at `/admin` with GitHub auth

## Project Structure

```
content/
  posts/           # Markdown posts
  pages/           # Static pages (about)
  config/site.json # Editable site settings (via CMS)
public/
  admin/           # Decap CMS
  uploads/         # Uploaded images from CMS
pages/             # Nuxt pages (index, posts, tags, search)
server/            # API routes (search, sitemap) + feed.xml
```

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Start dev server

```bash
npm run dev
```

3. Open `http://localhost:3000` and `http://localhost:3000/admin` (Decap CMS UI).

## Environment

Create `.env` (optional):

```
SITE_URL=https://yourblog.com
GITHUB_REPO=username/blog-repo
GITHUB_TOKEN=ghp_...
```

`SITE_URL` is used for sitemap and RSS canonical URLs.

## Decap CMS Configuration

- Config lives at `public/admin/config.yml`.
- Replace `repo: username/blog-repo` with your GitHub `owner/name`.
- Choose authentication method:
  - GitHub OAuth App (recommended for Cloudflare Pages)
  - Netlify Identity + Git Gateway (if deploying on Netlify)

### GitHub OAuth (Cloudflare Pages or any static hosting)

1. Create a GitHub OAuth App (Settings → Developer settings → OAuth Apps):
   - Homepage URL: `https://yourblog.com`
   - Authorization callback URL: `https://yourblog.com/admin/`
2. Expose the client ID in `config.yml` under `backend` → `app_id` (if needed) or configure per hosting instructions.
3. Ensure the repo has write access for your user.

### Netlify Identity + Git Gateway

1. Deploy to Netlify and enable Identity (Invite yourself as a user)
2. Enable Git Gateway under Identity → Services
3. Update `backend: { name: git-gateway }` in `config.yml`

## Deployment

### Cloudflare Pages

- New Project → Connect to your GitHub repo
- Build command: `npm run generate`
- Build output: `.output/public`
- Set environment var `SITE_URL=https://<your-domain>`

### Netlify

- New Site from Git → pick the repo
- Build command: `npm run generate`
- Publish directory: `.output/public`
- Add `SITE_URL` in Site settings → Build & deploy → Environment

## Writing Posts

- Use Decap CMS at `/admin` and publish to `main` (commits Markdown to `content/posts/`)
- Or write Markdown files directly in `content/posts/` with front matter:

```yaml
---
title: My Post
date: 2024-05-10
excerpt: Short summary
tags: [nuxt, vue]
hero: /uploads/image.jpg
---

Your content here...
```

## Images

- Uploaded via Decap CMS go to `public/uploads/`
- Reference with `/uploads/<filename>` in Markdown front matter or content

## Notes

- All pages are prerendered (SSG). Dynamic content (search index, sitemap, RSS) is generated at build time via server routes and included in the output.
- Comments (e.g., Giscus/Utterances) can be added by embedding their script in the post page if desired.

