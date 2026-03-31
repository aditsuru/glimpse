export function paginateResult<T, C>(
	items: T[],
	limit: number,
	getCursor: (lastItem: T) => C
): { items: T[]; nextCursor: C | null } {
	const hasNextPage = items.length > limit;

	const slicedItems = hasNextPage ? items.slice(0, limit) : items;

	return {
		items: slicedItems,
		nextCursor: hasNextPage
			? getCursor(slicedItems[slicedItems.length - 1])
			: null,
	};
}
