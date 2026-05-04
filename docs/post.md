## Feature: Posts

What: Users can create posts with text content and optional media attachments.

### DB

### **posts**

| column        | type      | notes                           |
| ------------- | --------- | ------------------------------- |
| id            | uuid (PK) |                                 |
| userId        | uuid (FK) | references profiles.userId      |
| body          | text      | nullable (attachment-only post) |
| hasAttachment | boolean   | derived flag, avoids JOIN       |
| views         | integer   | denormalized, updated by cron   |
| createdAt     | timestamp |                                 |
| updatedAt     | timestamp |                                 |

**Constraint:** `body OR hasAttachment must be present` (check constraint)

### **attachments**

| column        | type      | notes  |
| ------------- | --------- | ------ |
| id            | uuid (PK) |        |
| postId        | uuid (FK) |        |
| attachmentKey | text      | S3 key |
| mimeType      | text      |        |
| createdAt     | timestamp |        |

### **view_history**

| column    | type      | notes                              |
| --------- | --------- | ---------------------------------- |
| userId    | uuid (FK) | composite PK (userId, postId)      |
| postId    | uuid (FK) |                                    |
| createdAt | timestamp | last viewed at, used for feed sort |

### Procedures (oRPC)

- `post.create({ body?, attachmentKeys? })` → `{ postId }`
- `post.delete({ postId })` → `{ success }`
- `post.get({ postId })` → `Post`
- `post.getAllByUser({ username, cursor })` → paginated `Post[]`
- `post.getFeed({ cursor })` → paginated `Post[]`
- `post.getTrendingFeed({ cursor })` → paginated `Post[]` — Later scope

**Post object shape (every endpoint)**

```ts
{
  id, userId, body, hasAttachment, views,
  attachments: { url, mimeType }[],
  createdAt, updatedAt,
  // Later scope:
  likesCount, commentsCount, bookmarksCount
}
```

### Constraints & Rules

- Body or attachment required. Both allowed.
- No edit. Delete is owner-only.
- Private account posts: visible only to accepted followers + post owner.
  Enforced at query time via profile.visibility join — no visibility column on posts.
- views and view_history are batched — never written on request.
- Attachments are uploaded to S3 before post creation (presigned URL flow,
  same pattern as avatar/banner). Post is created only after upload confirms.

### Feed Logic

**getFeed** (Following feed)

- Posts from accepted-following accounts only.
- Unseen posts first, already-seen posts appended at end.
- Sorted by createdAt DESC within each group.
- Seen/unseen split derived from view_history at query time.

**getTrendingFeed** — Later scope

- Ranked by engagement signals.
- Requires likes/comments data. Deferred until those features ship.

### Pages

- `/` — Feed (Following)
- `/p/:postId` — Single post page
- `/trending` — Trending feed (Later scope)

### UI States

- Loading skeleton
- Empty feed state
- Own post → delete option
- Other's post → report option (redirects for now)
- `@mention` rendered as link + profile hover card trigger
- Mention notifications — Later scope

### View Batching (Redis + QStash)

**Redis keys**

```
{nodeEnv}:views:{postId}      → integer counter   (INCR on each view)
{nodeEnv}:history:{userId}    → list of postIds    (LPUSH on each view)
```

**Dedup**: before LPUSH, check SISMEMBER on a dedup set:

```
{nodeEnv}:history:seen:{userId} → set of postIds
```

Only INCR + LPUSH if postId not already in seen set. SADD after.

**Cron job (QStash)**

1. RENAME `history:{userId}` → `history:{userId}:flushing` (atomic, new views
   go to fresh key while processing old)
2. Bulk UPDATE posts.views += delta for all postIds in counters
3. Bulk INSERT view_history (upsert on conflict, update createdAt)
4. DEL all `:flushing` keys + processed counter keys
5. Repeat per user in batches of 500

**Why not heavy**: steps 2 and 3 are single bulk queries each, not N queries.
Lock contention risk is low at portfolio scale. If it becomes an issue,
chunk into 500-row batches per query.

### Out of Scope (Conscious Decisions)

- Likes & comments write batching (direct DB writes are fine at this scale).
- Post search in explore.
- Post editing.
- Per-post visibility control (visibility inherited from profile).
