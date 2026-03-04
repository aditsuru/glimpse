<answer>

_March 4, 2026 — IST_

---

_<main-point>_

**1 — server-only / client-only discipline (already covered but the rule in one place):**

```
server-only  → add to any file with DB, auth, secrets, service classes
client-only  → add to any file with browser APIs (localStorage, window, document)
```

Anything in `server/`, `connections/`, `trpc/server.tsx` gets `import "server-only"` at the top. Non-negotiable. It turns a runtime mystery into a build-time error.

---

**2 — Zustand — when and why:**

React Query owns server state — data that lives on the server and gets fetched. Zustand owns client state — data that only exists in the browser and never hits the server.

```
React Query:  posts, users, comments, anything from your DB
Zustand:      sidebar open/closed, selected filters, modal state,
              multi-step form progress, shopping cart (before checkout)
```

You don't need Zustand until you find yourself prop-drilling UI state through 4+ components or putting clearly-client-only state into React Query. When that happens:

```ts
// src/stores/ui.store.ts
import { create } from "zustand";

type UIStore = {
	sidebarOpen: boolean;
	toggleSidebar: () => void;
	activeModal: string | null;
	openModal: (id: string) => void;
	closeModal: () => void;
};

export const useUIStore = create<UIStore>((set) => ({
	sidebarOpen: false,
	toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
	activeModal: null,
	openModal: (id) => set({ activeModal: id }),
	closeModal: () => set({ activeModal: null }),
}));
```

Usage anywhere in client components — no providers needed unlike Redux:

```ts
const { sidebarOpen, toggleSidebar } = useUIStore();
```

One store per domain — `ui.store.ts`, `cart.store.ts`, `filters.store.ts`. Don't put everything in one giant store.

---

**3 — Feature folder structure at scale:**

What you have now works for a small app. When you have 20+ features it collapses. The production pattern:

```
src/
├── features/
│   ├── posts/
│   │   ├── api/
│   │   │   └── posts.queries.ts    ← useQuery hooks for posts
│   │   ├── components/
│   │   │   ├── PostCard.tsx
│   │   │   └── PostsList.tsx
│   │   ├── hooks/
│   │   │   └── useCreatePost.ts
│   │   └── stores/
│   │       └── posts-filter.store.ts
│   └── auth/
│       ├── components/
│       │   ├── SignInForm.tsx
│       │   └── SignUpForm.tsx
│       └── hooks/
│           └── useSignIn.ts
├── components/
│   └── ui/                         ← shared, not feature-specific
├── lib/                            ← shared utilities, clients
└── app/                            ← Next.js routes only, thin as possible
```

The rule: `app/` directory should contain almost no logic. Pages import from `features/`, not the other way around. A page file should be 20 lines max — just composition.

---

**4 — next.config.ts production gotchas:**

Things that silently break in production that work fine in dev:

```ts
// next.config.ts
const nextConfig = {
	// If you use sharp for image processing — install it explicitly
	// Next.js uses it automatically in prod but won't warn you in dev

	// External packages that should NOT be bundled by Next.js
	// (packages with native bindings, pino, drizzle etc)
	serverExternalPackages: ["pino", "pino-pretty", "@node-rs/argon2"],

	// Images — whitelist every external domain you load images from
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "your-s3-bucket.s3.amazonaws.com",
			},
		],
	},
};
```

`serverExternalPackages` is the one that bites hardest — if pino or your DB driver gets bundled instead of treated as external, you get weird runtime crashes only in production.

---

**5 — Metadata and SEO basics:**

Next.js App Router has a metadata API. Use it on every page — it costs nothing and matters for every client project:

```ts
// app/(main)/posts/[id]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
	const post = await getPost(params.id);

	return {
		title: post.title,
		description: post.content.slice(0, 160),
		openGraph: {
			title: post.title,
			description: post.content.slice(0, 160),
			images: [post.coverImage],
		},
	};
}
```

Static metadata for pages that don't need dynamic data:

```ts
export const metadata: Metadata = {
	title: {
		template: "%s | Glimpse", // ← PostTitle | Glimpse
		default: "Glimpse",
	},
	description: "...",
};
```

Put the template in `app/layout.tsx` and every page's `title` gets the suffix automatically.

---

**6 — Environment variable discipline in deployment:**

Three rules you'll thank yourself for:

**Rule 1:** Never hardcode any URL, key, or config. Even `localhost:3000`. Everything goes through `config` with Zod validation.

**Rule 2:** `NEXT_PUBLIC_` variables are baked into the client bundle at build time. If you change them in your hosting platform and redeploy, they update. If you just restart without rebuilding, they don't. Always rebuild after changing public env vars.

**Rule 3:** Keep a `.env.example` in your repo with every variable name but no values. Update it every time you add a new variable. Future you (and clients you hand off code to) will not remember what env vars are needed.

---

**7 — The production mental model checklist:**

```
Before deploying any Next.js project:
□ server-only on all server files
□ serverExternalPackages for native modules
□ Images remotePatterns configured
□ .env.example up to date
□ Metadata on every public page
□ Error boundaries on every page
□ Workspace TypeScript version selected in VS Code (yes it stays on the list)
```

_</main-point>_

_<conclusion>_
Phase 7 done. server-only discipline, Zustand for client state, feature folders at scale, next.config production traps, metadata API, env var discipline. All of it is "small things nobody mentions that bite you in production." You now have the full mental model. Go build Glimpse.
_</conclusion>_

</answer>

---

<answer>

_March 4, 2026 — IST_

---

_<main-point>_

Good problem to define first. You're asking two separate things:

```
Question 1: How do I know what infra a client needs (RAM, CPU, users)?
Question 2: How do I monitor what's actually happening after deployment?
```

Both are real gaps. Let me cover them properly.

---

**Question 1 — Recommending infra to clients:**

You don't calculate this from scratch. You use known benchmarks and work backwards from the client's expected usage. Here's the mental model:

**Step 1 — Ask the client three questions:**

```
1. How many concurrent users do you expect at peak?
   (concurrent = online at the same time, not total registered users)
2. Is traffic spiky (flash sales, launches) or steady (internal tool)?
3. Do you have a budget constraint or do you want ideal?
```

**Step 2 — Map to known benchmarks:**

For a Next.js app on a VPS:

```
0-100 concurrent users     → 1 vCPU, 1GB RAM   ($5-6/mo on Hetzner/DigitalOcean)
100-500 concurrent users   → 2 vCPU, 2GB RAM   ($12-20/mo)
500-2000 concurrent users  → 4 vCPU, 8GB RAM   ($40-80/mo)
2000+ concurrent users     → load balancer + multiple instances
```

For an Express + Socket.IO backend with Redis:

```
WebSockets are expensive on RAM — each persistent connection holds ~50KB
1000 concurrent socket connections ≈ 50MB RAM just for sockets
Add your app overhead (Redis, DB pool) ≈ 200-400MB minimum
So 1000 concurrent socket users = at least 1GB RAM comfortably
```

**Step 3 — Always recommend one tier above what they think they need:**

A client who says "I expect 50 users" has no idea. Recommend 2GB RAM. It costs $12/mo. The cost difference between tiers is negligible — the downtime from undersizing is not.

---

**For Vercel specifically — you don't manage RAM:**

Vercel is serverless. Each function invocation gets 1024MB RAM by default (configurable up to 3GB on Pro). You don't provision servers. The scaling is automatic.

What you tell the client instead:

```
Vercel free tier    → good for MVPs, side projects, < 100k requests/month
Vercel Pro ($20/mo) → needed for commercial projects, removes limits
Vercel Enterprise   → for high-scale, not your clients right now
```

For most of your clients — Next.js on Vercel + NeonDB + Upstash Redis = zero infra management. You don't need to talk about RAM at all. That's the value of this stack.

---

**Question 2 — Monitoring:**

Monitoring has four layers. You know layer 1. Here are the rest:

**Layer 1 — Logs (you know this):**
stdout → you're doing this with Pino already. Good.

**Layer 2 — Error tracking:**
When something breaks in production, you need to know immediately with a stack trace, not after the client messages you.

Tool: **Sentry** (free tier is generous)

```ts
// One line setup in Next.js
import * as Sentry from "@sentry/nextjs";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

Now every unhandled error sends you an email with the full stack trace, which user triggered it, what browser, what URL. This is the single highest value monitoring tool. Add it to every project.

**Layer 3 — Uptime monitoring:**
Is the server even running? You need to know before the client does.

Tool: **BetterUptime** or **UptimeRobot** (both have free tiers)
They ping your `/health` endpoint every minute. If it fails, you get a text/email. That's it. Your health route is already built — just plug in the URL.

**Layer 4 — Performance/analytics:**
How fast are pages loading, where are users dropping off, what's the p95 response time?

Tool: **Vercel Analytics** (built in, free on Pro) for Next.js
Tool: **PostHog** (free tier, open source) for user behavior
Tool: **Grafana + Prometheus** for self-hosted Express backends (overkill for now)

---

**What you actually need per project type:**

```
Next.js on Vercel (most client projects):
  □ Sentry for errors             ← non-negotiable, add to template
  □ Vercel Analytics              ← free, already there
  □ UptimeRobot on /health        ← 5 minute setup

Express on VPS (more complex clients):
  □ Sentry for errors
  □ Pino logs → ship to Logtail or Axiom (log aggregation, searchable)
  □ UptimeRobot on /health
  □ Grafana eventually, not now
```

---

**What to tell clients:**

You don't need to explain RAM and monitoring to them. You translate it:

```
"Your app will handle up to X concurrent users and auto-scales on Vercel.
I'll set up error monitoring so if anything breaks, I know before you do.
Uptime monitoring pings the server every minute and alerts me immediately."
```

That's the client-facing version. They care about reliability and that you're on top of it — not the underlying mechanism.

---

**The one number you should know cold:**

Vercel's free tier allows **100GB bandwidth and 100k function invocations per month**. For most client MVPs, this lasts months before needing to upgrade. When they ask "what will hosting cost?" — your answer for most projects is "$0/month on Vercel until you get real traction, then $20/month on Vercel Pro."

_</main-point>_

_<side-note>_

Load testing — if a client is genuinely worried about scale before launch, you can use **k6** (free, open source) to simulate 500 concurrent users hitting your app and see where it breaks. This is a premium service you could offer — "pre-launch load test included." Most freelancers don't offer this. It takes 2 hours to learn.

_</side-note>_

_<conclusion>_

Infra sizing: ask for concurrent users, map to known benchmarks, recommend one tier up. For Vercel projects skip the conversation entirely — it autoscales. Monitoring has four layers — you know logs, add Sentry for errors (non-negotiable), UptimeRobot for uptime, Vercel Analytics for performance. Sentry goes into every template now. The client-facing translation is always about reliability, never about RAM.
_</conclusion>_

</answer>
