import { useEffect, useRef } from "react";

interface UseViewCountProps {
	postId: string;
	callback: (id: string) => void;
}

export function useViewCount<T extends HTMLElement>({
	postId,
	callback,
}: UseViewCountProps) {
	const ref = useRef<T>(null);
	const isFired = useRef(false);

	useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !isFired.current) {
					isFired.current = true;
					callback(postId);
				}
			},
			{
				threshold: 0.1,
			}
		);

		observer.observe(ref.current);

		return () => observer.disconnect();
	}, [callback, postId]);

	return ref;
}
