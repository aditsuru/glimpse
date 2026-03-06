<answer>

## March 06, 2026 — IST

_<main-point>_

You're context-switching between UI, data, and new features all at once. That's why it feels messy. Stop adding features until the core loop works. Here's the order:

---

## Phase 1 — Complete the core UI shell _(you're here)_

Finish these screens with static/hardcoded data only. No API yet.

- [ ] Feed page — PostCard component (text, media, text+media variants)
- [ ] Profile page — header, stats, post grid
- [ ] Create post page — form with text + media upload input
- [ ] Settings page — basic layout

Don't touch followers popups, notifications, or anything else yet. These four screens are your entire app at its core.

---

## Phase 2 — Wire the auth (already done, verify it works end to end)

- [ ] Sign up → email verify → redirect to feed
- [ ] Sign in → redirect to feed
- [ ] Session guard on layout works (you have this)

---

## Phase 3 — First API call: the feed

This is your most important milestone. Everything real starts here.

- [ ] Set up React Query (`QueryClientProvider` in root layout)
- [ ] Write the `getPosts(page, seed)` API call
- [ ] Replace hardcoded posts with `useInfiniteQuery`
- [ ] Add Intersection Observer for infinite scroll trigger
- [ ] Add the **loading skeleton** (shown while first page loads)
- [ ] Add the **"end of feed" message** (shown when `hasNextPage` is false)
- [ ] Add a **"loading more" spinner** between pages (shown during `fetchNextPage`)

The three states of an infinite feed are: _loading_, _loaded + more available_, _loaded + finished_. React Query gives you `isLoading`, `isFetchingNextPage`, and `hasNextPage` — those three booleans map exactly to those three states.

---

## Phase 4 — Create post

- [ ] Upload media to storage (S3, Cloudflare R2, Supabase storage — pick one)
- [ ] Submit post form → API call → optimistic update in feed

---

## Phase 5 — Profile

- [ ] Fetch real user data
- [ ] Fetch user's posts
- [ ] Follow / Unfollow button + API call

---

## Phase 6 — Popups and overlays _(your followers modal etc.)_

Only build these after Phase 5. They depend on real follow data existing.

- [ ] Followers list modal — `Dialog` from shadcn
- [ ] Following list modal — same `Dialog`
- [ ] Post detail modal or page (comments, full view)

---

## Phase 7 — Polish

- [ ] Error states (API failed, no posts found)
- [ ] Empty states (new user with no feed content)
- [ ] Toast notifications for actions (posted, followed, error)
- [ ] Mobile navbar wired up with real navigation

---

**Your immediate next action:** Finish the PostCard component with static data. That's it. Don't think about Phase 3 until Phase 1 is done.

_</main-point>_

_<conclusion>_
You're in Phase 1. The feed API + infinite scroll is Phase 3 and it will answer your `useInfiniteQuery` loader and "end of feed" questions naturally when you get there — those problems become obvious to solve once the query is set up. Don't jump ahead.
_</conclusion>_

</answer>
