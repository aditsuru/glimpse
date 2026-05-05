import { useEffect, useRef } from "react";

export function useViewCount(postId: string, onView: (id: string) => void) {
	const ref = useRef<HTMLDivElement>(null);
	const hasFired = useRef(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasFired.current) {
					hasFired.current = true;
					onView(postId);
				}
			},
			{ threshold: 0.5 } // 50% of post must be visible
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [postId, onView]);

	return ref;
}
