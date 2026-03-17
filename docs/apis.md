# API Documentation

## Features

- **Feed:** Custom algorithmic delivery.
- **Social Interactions:** Likes, followers, following, bookmarks, and 1-level nested comments with mentions.
- **Rich Posts:** Support for mentions, Markdown, embeds, and carousels of images, GIFs, and videos.
- **User Profiles:** Includes name, username, email, bio, avatar, banner, personal website link, and joined date.

## Pagination

Paginated endpoints use cursor-based pagination. Pass an optional `cursor`
(the last item's ID from the previous page) and a `limit` (default: 10).

Return shape for all paginated responses:

```typescript
type Paginated<T> = {
	items: T[];
	nextCursor: string | null; // null = no more pages
};
```

## Endpoints

### 1. Feed

#### Get Feed

| Field            | Value                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Route**        | `os.feed`                                                                                                                  |
| **Return Type**  | `Paginated<Post>` — includes views, likes, comments, and bookmark counts; `hasUserLiked` and `hasUserBookmarked` booleans. |
| **Requirements** | Auth headers + `CursorMetaData` (optional) — see `feed.md` for full pagination spec                                        |

### 2. Posts

#### Get Post

| Field            | Value                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Route**        | `os.post`                                                                                                            |
| **Return Type**  | Post object — includes views, likes, comments, and bookmark counts; `hasUserLiked` and `hasUserBookmarked` booleans. |
| **Requirements** | `postId`                                                                                                             |

#### Create Post

| Field            | Value                                       |
| ---------------- | ------------------------------------------- |
| **Route**        | `os.post.create`                            |
| **Return Type**  | Created post object                         |
| **Requirements** | Post object with attachments + auth headers |

​```typescript
type Attachment = {
type: "image" | "gif" | "video";
fileUrl: string;
};

type CreatePost = {
body: string;
attachments: Attachment[];
};
​```

#### Delete Post

| Field            | Value                   |
| ---------------- | ----------------------- |
| **Route**        | `os.post.delete`        |
| **Return Type**  | Success boolean         |
| **Requirements** | `postId` + auth headers |

---

### 3. Likes

#### Post Likes

| Operation         | Route                        | Returns           |
| ----------------- | ---------------------------- | ----------------- |
| Get Like Count    | `os.post.like.getLikes`      | Count             |
| Get Likes History | `os.profile.getLikesHistory` | `Paginated<Post>` |
| Add Like          | `os.post.like.add`           | Success boolean   |
| Remove Like       | `os.post.like.remove`        | Success boolean   |

_Get Like Count, Add Like, Remove Like — Requirements: `postId` + auth headers_
_Get Likes History — Requirements: `userId` + optional `cursor` + auth headers_

#### Comment Likes

| Operation      | Route                      | Returns         |
| -------------- | -------------------------- | --------------- |
| Get Like Count | `os.comment.like.getLikes` | Count           |
| Add Like       | `os.comment.like.add`      | Success boolean |
| Remove Like    | `os.comment.like.remove`   | Success boolean |

_Requirements: `commentId` + auth headers_

---

### 4. Comments

#### Get Post Comments

| Field            | Value                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------- |
| **Route**        | `os.comment.getByPost`                                                                        |
| **Return Type**  | `Paginated<Comment>` — includes like count, nested comment count, and `hasUserLiked` boolean. |
| **Requirements** | `postId` + optional `cursor`                                                                  |

#### Get Nested Comments

| Field            | Value                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| **Route**        | `os.comment.getByComment`                                              |
| **Return Type**  | `Paginated<Comment>` — includes like count and `hasUserLiked` boolean. |
| **Requirements** | `commentId` + optional `cursor`                                        |

#### Get Comments History

| Field            | Value                           |
| ---------------- | ------------------------------- |
| **Route**        | `os.profile.getCommentsHistory` |
| **Return Type**  | `Paginated<Comment>`            |
| **Requirements** | `userId` + optional `cursor`    |

#### Create Comment

| Field            | Value                         |
| ---------------- | ----------------------------- |
| **Route**        | `os.comment.create`           |
| **Return Type**  | Created comment object        |
| **Requirements** | Comment object + auth headers |

#### Delete Comment

| Field            | Value                      |
| ---------------- | -------------------------- |
| **Route**        | `os.comment.delete`        |
| **Return Type**  | Success boolean            |
| **Requirements** | `commentId` + auth headers |

---

### 5. Followers

| Operation      | Route                      | Returns                  |
| -------------- | -------------------------- | ------------------------ |
| Get Followers  | `os.profile.getFollowers`  | `Paginated<UserProfile>` |
| Get Followings | `os.profile.getFollowings` | `Paginated<UserProfile>` |
| Follow         | `os.profile.follow.add`    | Success boolean          |
| Unfollow       | `os.profile.follow.remove` | Success boolean          |

_Get Followers / Get Followings — Requirements: `userId` + optional `cursor`_
_Follow / Unfollow — Requirements: `userId` + auth headers_

---

### 6. Bookmarks

| Operation             | Route                            | Returns           |
| --------------------- | -------------------------------- | ----------------- |
| Get Bookmark Count    | `os.post.bookmark.getBookmarks`  | Count             |
| Get Bookmarks History | `os.profile.getBookmarksHistory` | `Paginated<Post>` |
| Add Bookmark          | `os.post.bookmark.add`           | Success boolean   |
| Remove Bookmark       | `os.post.bookmark.remove`        | Success boolean   |

_Get Bookmark Count, Add Bookmark, Remove Bookmark — Requirements: `postId` + auth headers_
_Get Bookmarks History — Requirements: auth headers + optional `cursor`_

---

### 7. Profile

#### Get Profile

| Field            | Value               |
| ---------------- | ------------------- |
| **Route**        | `os.profile`        |
| **Return Type**  | Full profile object |
| **Requirements** | `userId`            |

#### Update Profile

| Field            | Value                         |
| ---------------- | ----------------------------- |
| **Route**        | `os.profile.update`           |
| **Return Type**  | Success boolean               |
| **Requirements** | Profile fields + auth headers |

#### Search Users

| Field            | Value                          |
| ---------------- | ------------------------------ |
| **Route**        | `os.profile.searchUsers`       |
| **Return Type**  | `Paginated<UserProfile>`       |
| **Requirements** | `username` + optional `cursor` |

#### Check Username Availability

| Field            | Value                      |
| ---------------- | -------------------------- |
| **Route**        | `os.profile.checkUsername` |
| **Return Type**  | Boolean                    |
| **Requirements** | `username`                 |

#### Check Email Availability

| Field            | Value                   |
| ---------------- | ----------------------- |
| **Route**        | `os.profile.checkEmail` |
| **Return Type**  | Boolean                 |
| **Requirements** | `email`                 |

### 8. Get Presigned Upload URL

| Field            | Value                                       |
| ---------------- | ------------------------------------------- |
| **Route**        | `os.upload.getPresignedUrl`                 |
| **Return Type**  | `{ presignedUrl: string, fileUrl: string }` |
| **Requirements** | `fileType` (MIME string) + auth headers     |

#### File Uploads (S3)

Uploading a file requires **two operations:**

1. **Get Presigned URL** (`os.upload.getPresignedUrl`) — Frontend requests a
   presigned URL from the backend, passing the file's MIME type. Backend validates
   the type and returns a `{ presignedUrl, fileUrl }` pair. Frontend then uploads
   the file **directly to S3** via a `PUT` request to `presignedUrl`. The file
   lands in a temporary `uploads/` prefix.

2. **Confirm on Post/Profile Create** — When the user submits the post or saves
   their profile, the backend moves the file from `uploads/{uuid}` to
   `media/{uuid}` (S3 `CopyObject` + `DeleteObject`) before saving the final
   `fileUrl` to the database.

> ⚠️ Any file that remains in `uploads/` (i.e. user aborted) is automatically
> deleted after 24 hours via an S3 Lifecycle Rule. Only files moved to `media/`
> are permanent.
