# Frontend Pages

## Layout

The app uses a **4-column grid** on desktop, collapsed on mobile:

| Column  | Content                 | Mobile  |
| ------- | ----------------------- | ------- |
| 1st     | Profile card            | Hidden  |
| 2nd–3rd | Feed                    | Visible |
| 4th     | Search bar + navigation | Hidden  |

---

## Route Groups & Auth Rules

Handled via custom logic in `layout.tsx` — not using Better Auth's
built-in email requirement (too strict). Each route group manages
email verification independently.

| Route Group      | Condition                          |
| ---------------- | ---------------------------------- |
| Sign in, Sign up | Must be **logged out**             |
| Verify Email     | Must be logged in + **unverified** |
| Password Reset   | Must be logged in + **verified**   |
| All other routes | Must be logged in + **verified**   |

**Better Auth config notes:**

- `username` added as an additional field
- `image` set to `false` (managed manually, not by Better Auth)

---

## Pages

### 1. Home — `/`

**Endpoints:**

- `os.feed` — main feed

**Major Components:**

- `ProfileCard` _(col 1, desktop only)_ — see shared components
- `FeedList` _(col 2–3)_ — infinite scroll
- `PostCard` — single post preview
- `SearchSidebar` _(col 4, desktop only)_ — see shared components

---

### 2. Profile — `/profile/[userId]`

**Endpoints:**

- `os.profile`
- `os.profile.getFollowers` / `os.profile.getFollowings`
- `os.profile.follow.add` / `os.profile.follow.remove`
- `os.profile.update` _(own profile only)_
- `os.profile.getLikesHistory` _(own profile only)_
- `os.profile.getBookmarksHistory` _(own profile only)_
- `os.profile.getCommentsHistory` _(own profile only)_
- S3 presigned URL — avatar / banner upload _(own profile only)_

**Tabs:**

| Tab       | Own Profile | Public Profile |
| --------- | ----------- | -------------- |
| Posts     | ✅          | ✅             |
| Bookmarks | ✅          | ❌             |
| Likes     | ✅          | ❌             |
| Comments  | ✅          | ❌             |

**Major Components:**

- `ProfileHeader` — avatar, banner, bio, follow button, edit
  button _(own only)_
- `FollowersPopover` / `FollowingsPopover` — paginated popover list
- `PostList` — paginated, uses `PostCard`
- `CommentHistoryList` — uses `CommentCard` _(special component)_
- `EditProfileModal` _(own profile only)_

---

### 3. Post — `/post/[postId]`

**Endpoints:**

- `os.post`
- `os.comment.getByPost` / `os.comment.getByComment`
- `os.comment.create` / `os.comment.delete`
- `os.post.like.add` / `os.post.like.remove`
- `os.comment.like.add` / `os.comment.like.remove`
- `os.post.bookmark.add` / `os.post.bookmark.remove`

**Major Components:**

- `PostDetail` — full post with markdown/embed rendering
- `CommentThread` — nested comments, paginated
- `CommentInput` — with mention support
- `PostActions` — like, bookmark, share

---

### 4. Create — `/create`

**Endpoints:**

- `os.post.create`
- S3 presigned URL — attachment uploads

**Major Components:**

- `PostEditor` — markdown + mention support
- `AttachmentUploader` — image / GIF / video → uploads to S3,
  returns `fileUrl`
- `CarouselPreview` — preview before submitting

---

### 5. Settings — `/settings`

**Endpoints:**

- `os.profile.update`
- `os.profile.checkUsername` / `os.profile.checkEmail`
- S3 presigned URL — avatar / banner update

**Major Components:**

- `AccountSettingsForm` — username, email, password
- `ProfileSettingsForm` — name, bio, website, avatar, banner
- Account operations section — e.g. delete account, linked accounts

---

### 6. Search — `/search` _(Mobile only)_

> Redirects to `/` on desktop.

**Endpoints:**

- `os.profile.searchUsers`

**Major Components:**

- `SearchSidebar` _(shared, see below)_ — rendered full-page on mobile

---

## Shared Components

### `ProfileCard`

Used in: homepage grid (col 1), profile page

- Avatar, banner
- Follower / following counts → `FollowersPopover` /
  `FollowingsPopover` with pagination
- Tabs: Posts, Bookmarks, Likes, Comments
  _(Bookmarks, Likes, Comments hidden on public profile)_
- Tab content rendered with `PostCard` or `CommentCard`

### `SearchSidebar`

Used in: homepage grid (col 4), `/search` page

- Search input with debounce
- `UserResults` — paginated profile matches using `os.profile.searchUsers`
