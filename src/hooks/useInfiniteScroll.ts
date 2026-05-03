import { useEffect, useRef } from "react";

export function useInfiniteScroll(
	fetchNextPage: () => void,
	isFetching: boolean
) {
	const ref = useRef<HTMLDivElement>(null);
	const fetchNextPageRef = useRef(fetchNextPage);

	useEffect(() => {
		fetchNextPageRef.current = fetchNextPage;
	}, [fetchNextPage]);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isFetching) {
					fetchNextPageRef.current();
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [isFetching]);

	return ref;
}
