## Pagination

All list endpoints use cursor-based pagination.

### Pattern

Request:

- cursor: string (ISO date) — optional, absent on first page

Response:

- items: T[]
- nextCursor: string | null — null means no more pages

### Schema

input: z.object({
cursor: z.string().optional(),
// other filters
})
output: z.object({
items: z.array(itemSchema),
nextCursor: z.string().nullable(),
})

### Service

- Default limit defined per endpoint (e.g. PROFILE_PAGINATION_LIMIT)
- Fetch limit + 1 rows
- If length > limit → hasMore = true, slice last item, set nextCursor = last item's createdAt.toISOString()
- If length <= limit → nextCursor = null
- Always order by createdAt DESC (newest first) unless specified

### React Query

- Use useInfiniteQuery not useQuery
- getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
- undefined stops fetching, null would too but undefined is the React Query convention
- Flatten pages: data.pages.flatMap(p => p.items)
