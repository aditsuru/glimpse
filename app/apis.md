# API Documentation

## Features

- **Feed:** Custom algorithmic delivery.
- **Social Interactions:** Likes, followers, following, bookmarks, and 1-level nested comments with mentions.
- **Rich Posts:** Support for mentions, Markdown, embeds, and carousels of images, GIFs, and videos.
- **User Profiles:** Includes name, username, email, bio, avatar, banner, personal website link, and joined date.

## Endpoints

### 1. Feed

| Field            | Value                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Route**        | `os.feed`                                                                                                                      |
| **Return Type**  | Array of Post objects — includes views, likes, comments, and bookmark counts; `hasUserLiked` and `hasUserBookmarked` booleans. |
| **Requirements** | Auth headers                                                                                                                   |

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

```typescript
type Attachment = {
	type: "image" | "gif" | "video";
	fileUrl: string;
};

type CreatePost = {
	body: string;
	attachments: Attachment[];
};
```

#### Delete Post

| Field            | Value                   |
| ---------------- | ----------------------- |
| **Route**        | `os.post.delete`        |
| **Return Type**  | Success boolean         |
| **Requirements** | `postId` + auth headers |

### 3. Likes

#### Post Likes

| Operation         | Route                        | Returns         |
| ----------------- | ---------------------------- | --------------- |
| Get Like Count    | `os.post.like.getLikes`      | Count           |
| Get Likes History | `os.profile.getLikesHistory` | Array of posts  |
| Add Like          | `os.post.like.add`           | Success boolean |
| Remove Like       | `os.post.like.remove`        | Success boolean |

_Requirements: `postId` + auth headers_

#### Comment Likes

| Operation      | Route                      | Returns         |
| -------------- | -------------------------- | --------------- |
| Get Like Count | `os.comment.like.getLikes` | Count           |
| Add Like       | `os.comment.like.add`      | Success boolean |
| Remove Like    | `os.comment.like.remove`   | Success boolean |

_Requirements: `commentId` + auth headers_

### 4. Comments

#### Get Comments

| Field            | Value                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Route**        | `os.comment`                                                                                                     |
| **Return Type**  | Array of comment objects — includes like count, nested comment count (if top-level), and `hasUserLiked` boolean. |
| **Requirements** | `postId` or `commentId`                                                                                          |

#### Get Comments History

| Field            | Value                           |
| ---------------- | ------------------------------- |
| **Route**        | `os.profile.getCommentsHistory` |
| **Return Type**  | Array of comments               |
| **Requirements** | `userId`                        |

#### Create Comment

| Field            | Value                         |
| ---------------- | ----------------------------- |
| **Route**        | `os.comment.create`           |
| **Return Type**  | Created comment objects       |
| **Requirements** | Comment object + auth headers |

#### Delete Comment

| Field            | Value                      |
| ---------------- | -------------------------- |
| **Route**        | `os.comment.delete`        |
| **Return Type**  | Success boolean            |
| **Requirements** | `commentId` + auth headers |

### 5. Followers

| Operation      | Route                      | Returns                |
| -------------- | -------------------------- | ---------------------- |
| Get Followers  | `os.profile.getFollowers`  | Array of user profiles |
| Get Followings | `os.profile.getFollowings` | Array of user profiles |
| Follow         | `os.profile.follow.add`    | Success boolean        |
| Unfollow       | `os.profile.follow.remove` | Success boolean        |

_Requirements: `userId` + auth headers_

### 6. Bookmarks

| Operation             | Route                            | Returns         |
| --------------------- | -------------------------------- | --------------- |
| Get Bookmark Count    | `os.post.bookmark.getBookmarks`  | Count           |
| Get Bookmarks History | `os.profile.getBookmarksHistory` | Array of posts  |
| Add Bookmark          | `os.post.bookmark.add`           | Success boolean |
| Remove Bookmark       | `os.post.bookmark.remove`        | Success boolean |

_Requirements: `postId` + auth headers_

### 7. Profile

- **Get Profile** — `os.profile` | Returns: full profile object | Requirements: `userId`
- **Update Profile** — `os.profile.update` | Returns: success boolean | Requirements: profile fields + auth headers
- **Check Username Availability** — `os.profile.checkUsername` | Returns: boolean | Requirements: `username`
- **Check Email Availability** — `os.profile.checkEmail` | Returns: boolean | Requirements: `email`
- **Search Users** - `os.profile.searchUsers` | Returns: array of profile objects | Requirements: `username`
