import { useCallback, useEffect, useRef } from "react";

export function useInfiniteScroll(
	fetchNextPage: () => void,
	isFetchingNextPage: boolean
) {
	const fetchNextPageRef = useRef(fetchNextPage);
	const isFetchingNextPageRef = useRef(isFetchingNextPage);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		fetchNextPageRef.current = fetchNextPage;
	}, [fetchNextPage]);

	useEffect(() => {
		isFetchingNextPageRef.current = isFetchingNextPage;
	}, [isFetchingNextPage]);

	const ref = useCallback((node: HTMLDivElement | null) => {
		if (observerRef.current) {
			observerRef.current.disconnect();
			observerRef.current = null;
		}

		if (!node) return;

		observerRef.current = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isFetchingNextPageRef.current) {
					fetchNextPageRef.current();
				}
			},
			{ threshold: 0.1 }
		);

		observerRef.current.observe(node);
	}, []);

	return ref;
}
