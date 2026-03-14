# Feed System

### Algorithm Logic

1. **Cache Retrieval:** Fetch the user's already-seen posts from Redis.
2. **Database Query:** Fetch posts from the database **EXCLUDING** the seen posts, **AFTER** the cursor, **FILTERED** by the feed algorithm and **LIMITED** by the pagination number.
3. **Fallback Mechanism:** Each entry in the seen-log is scored by the Unix timestamp of when it was seen, enabling oldest-to-newest ordering. If the database returns 0 or fewer than 10 posts, posts are picked from Redis in oldest-to-newest order.

> ⚠️ **Note:** This will result in an infinitely repeating feed, which is intentional.

4. **View Updates:** On IntersectionObserver signal, a view-update request is sent to Redis and later flushed to the database by a cron job.

### Feed Ranking Formula

Post priority is determined by the following decay formula:

$$Score = \frac{P - 1}{(T + 2)^G}$$

| Variable | Name    | Description                                                                  |
| -------- | ------- | ---------------------------------------------------------------------------- |
| **P**    | Points  | Engagement metric: `(Likes × 2) + (Comments × 5) + Views`                    |
| **T**    | Time    | Age of the post in hours. `+2` prevents division by zero for new posts.      |
| **G**    | Gravity | Decay speed. Default: `1.8`. Higher values cause older posts to drop faster. |

**Note:** For brand new post in which `P = 0`, overwrite P with 1.

### Pagination Strategy

The backend always queries **+1 posts beyond the pagination limit** (from both the database and Redis when applicable). This extra post is used to determine whether more pages exist, enabling React Query infinite scrolling without a separate count query.

### Cursor

**DTO Shape:**

```typescript
type CursorMetaData =
	| { source: "db"; cursor: string } // postId
	| { source: "redis"; cursor: number }; // Unix timestamp (score)
```

**Redis Cache Shape:**

```text
Key:    feed:seen:{userId}
Type:   Redis Sorted Set (ZADD)
Score:  Unix timestamp (when the post was seen)
Member: postId (string)
Cap:    Maximum 500 members. On each insert, remove the oldest
        entries beyond 500 using ZREMRANGEBYRANK.
```
