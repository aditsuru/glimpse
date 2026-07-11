# Glimpse

<div align="left">

[![Stars](https://img.shields.io/github/stars/aditsuru/glimpse?style=flat)][stars-url]
[![Discord](https://img.shields.io/discord/1313767817996402698?style=flat&logo=discord&logoColor=white&label=Discord&color=5865F2)][discord-url]
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=aditsuru.glimpse)

</div>

<div align="center">

![banner](./assets/banner.png)

</div>

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-glimpse.aditsuru.com-white?style=flat&labelColor=F03A89)][live-url]

</div>

Glimpse is a solo, full-stack portfolio project — a social platform built end-to-end to see how far I could take the boring-but-necessary parts most feed-app tutorials skip: a real trending algorithm, a notification system that actually groups activity instead of spamming you, and the moderation/legal plumbing (reports, bans, DMCA intake) that any public platform eventually needs whether you plan for it or not.

Posts support Markdown-style bodies, spoiler tags, and image/GIF/video carousels. Comments are threaded one level deep. Every interaction — likes, comments, follows, replies — feeds into a real-time notification system that stacks repeated activity into a single card instead of flooding your inbox. The trending feed is backed by a Redis sorted set that nudges live on every interaction and fully recomputes on a schedule, so ranking stays fresh without hammering Postgres on every request.

### Tech Stack

#### Frontend

[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=flat&logo=react%20query&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-593D88?style=flat&logo=react&logoColor=white)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-black?style=flat&logo=shadcnui&logoColor=white)](https://ui.shadcn.com)

#### Backend

![oRPC](https://img.shields.io/badge/oRPC-%232563EB.svg?style=flat&logo=orpc&logoColor=white)
[![Better Auth](https://img.shields.io/badge/Better_Auth-black?style=flat&logo=auth0&logoColor=white)](https://better-auth.com)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat&logo=zod&logoColor=white)

#### Database & Cache

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=flat&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-00E9A3?style=flat&logo=redis&logoColor=black)](https://upstash.com)

#### Storage & Jobs

![S3-Compatible](https://img.shields.io/badge/S3_Compatible-FF9900?style=flat&logo=amazons3&logoColor=white)
[![Upstash Workflow](https://img.shields.io/badge/Upstash_Workflow-00E9A3?style=flat&logo=upstash&logoColor=black)](https://upstash.com/docs/workflow)

---

<div align="center">

![trending feed](./assets/trending-feed.png)

</div>

### Features

- Two feeds: a chronological following feed and a Redis-backed trending feed with live score nudges + scheduled decay
- Unseen-first post ordering, with already-seen posts pushed to the bottom instead of hidden
- Cursor-based infinite scroll everywhere — no offset pagination, no duplicate posts on shifting ranks
- Threaded comments (one level deep), likes on both posts and comments
- Follows with public/private accounts, follow requests, and accept/reject flow
- Grouped notification system — repeated likes/comments/follows collapse into one card instead of spamming the feed
- Direct-to-S3 uploads via presigned URLs, no file ever touches the app server
- User reporting on posts, comments, and profiles, with categorized reasons
- Admin dashboard to review reports, take down content, and ban users (temporary or permanent)
- DMCA takedown intake with the fields actually required for a legally valid notice
- Platform-wide broadcast announcements from the admin panel
- Rate limiting on the API layer to keep abuse and runaway loops from taking down the database
- Dynamic sitemap, robots.txt, and PWA manifest so the app installs like a native app on mobile

### How the Feed Works

**Following feed** — straightforward chronological ordering from people you follow, with one twist: posts you've already seen (tracked via Redis + a Postgres fallback) get pushed to the bottom of each page instead of disappearing, so nothing gets lost if you're catching up after a while.

**Trending feed** — ranked by a decay score kept live in a Redis sorted set:

```
Score = (1 + Views × 0.5 + Likes × 2 + Comments × 4) / (AgeHours + 2)^1.2

```

Every like, comment, or view nudges a post's score immediately via `ZINCRBY`, so the feed feels responsive without a full recompute on every interaction. A scheduled job recalculates the full formula from Postgres and atomically swaps it into place — so the feed is never mid-rebuild or briefly empty. Pagination uses a `(score, id)` cursor instead of an offset, which avoids the classic bug where a shifting score duplicates or skips a post between page loads.

View counts themselves are batched in Redis as users scroll and flushed to Postgres by a nightly job that renames each user's pending history key before writing — so a failed write never silently drops views that were already counted.

<div align="center">

![notifications](./assets/notifications.png)

</div>

### Trust & Safety

The parts of a real platform that don't show up in a demo but matter the moment real people use it:

- **Reports** — any post, comment, or profile can be reported with a categorized reason; admins review, resolve, or dismiss from a dashboard, with the reporter notified either way
- **Bans** — temporary suspensions keep an account's content visible but lock them out; permanent bans delete the account entirely and block the email from re-registering
- **DMCA** — a dedicated intake form collecting what's actually legally required for a valid takedown notice (claimant identity, described work, infringing URL, a signed good-faith statement), separate from casual in-app reports
- **Moderation actions notify affected users** — content removal and bans both trigger a notification explaining what happened, instead of a silent disappearance

<div align="center">

![admin dashboard](./assets/admin-dashboard.png)

</div>

### What I Learned

- Why offset pagination breaks on any feed with a live-changing sort order, and how to design a cursor around a mutable score instead of a mutable position
- Building a real-time-ish ranking system with Redis sorted sets — live nudges for responsiveness, scheduled full recomputation for correctness, and an atomic swap so the feed never serves stale or empty data mid-rebuild
- Designing a notification system that groups repeated activity into a single row instead of one row per event, and the tradeoffs in deciding what "resolves" a notification versus what creates a new one
- The gap between "auth-gated by default" (how most app scaffolding starts) and "public by default, gated for interaction" (how social platforms actually work) — and how expensive that assumption is to change after the fact
- That session cookies can outlive the database row they represent, and why "ban a user" is a harder problem than a single `DELETE` statement
- Structuring a growing oRPC API across dozens of modules with shared Zod schemas, without the frontend and backend contracts drifting apart

[stars-url]: https://github.com/aditsuru/glimpse/stargazers
[discord-url]: https://discord.gg/HP2YPGSrWU
[live-url]: https://glimpse.aditsuru.com
