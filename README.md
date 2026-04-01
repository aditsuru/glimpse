# Glimpse

<div align="left">

[![Stars](https://img.shields.io/github/stars/aditsuru/glimpse?style=flat)][stars-url]
[![Discord](https://img.shields.io/discord/1313767817996402698?style=flat&logo=discord&logoColor=white&label=Discord&color=5865F2)][discord-url]
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=aditsuru.glimpse)

</div>

<div align="center">

![banner](./assets/banner.png)

</div>

<!-- demo link here -->

Glimpse is a social platform built around an algorithmic feed that surfaces content based on engagement and recency. Posts support Markdown, mentions, embeds, and media carousels. Engagement — likes, comments, views, bookmarks — is tracked in real time, with view counts batched through Redis and flushed asynchronously to keep the database load minimal.
The feed is personalized per user, excludes already-seen content, and degrades gracefully when new content runs out. Authentication is handled with email verification enforced at the route group level, with custom logic to keep the flow flexible without being permissive.

> [!NOTE]
> Backend complete. Frontend in progress.

### Tech Stack

#### Frontend

[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=flat&logo=react%20query&logoColor=white)

#### Backend

![oRPC](https://img.shields.io/badge/oRPC-%232563EB.svg?style=flat&logo=orpc&logoColor=white)
[![Better Auth](https://img.shields.io/badge/Better_Auth-black?style=flat&logo=auth0&logoColor=white)](https://better-auth.com)

#### Database & Cache

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=flat&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Redis](https://img.shields.io/badge/Redis-FF4438?style=flat&logo=redis&logoColor=white)](https://redis.io)

#### Storage

[![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=flat&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3)

### Features

- Algorithmic feed with time-decay ranking
- Cursor-based infinite scroll
- 1-level nested comments with mentions
- Rich posts — Markdown, embeds, image/GIF/video carousels
- Likes, bookmarks, followers
- Direct-to-S3 file uploads via presigned URLs
- Email verification flow with custom route group logic

### How the Feed Works

Posts are ranked by a decay formula borrowed from Hacker News:

```
Score = (P - 1) / (T + 2)^1.8
```

Where `P` is an engagement score `(Likes × 2) + (Comments × 5) + Views`, and `T` is the post's age in hours. Older posts naturally drop in priority.

Each user's seen posts are tracked in Redis as a sorted set, scored by timestamp. The feed excludes already-seen posts and falls back to the oldest seen posts once the unseen pool is exhausted.

View tracking is batched — counts are written to Redis on scroll and flushed to the database by a cron job.

### What I Learned

- Designing cursor-based pagination for social data and why offset pagination breaks on live feeds
- How Redis sorted sets work and using them for efficient, time-ordered seen-post tracking
- Presigned URL pattern for direct browser-to-S3 uploads
- Managing auth route groups with custom middleware instead of relying on library defaults
- Structuring an oRPC API with consistent return types and shared pagination contracts

[stars-url]: https://github.com/aditsuru/glimpse/stargazers
[discord-url]: https://discord.gg/HP2YPGSrWU
