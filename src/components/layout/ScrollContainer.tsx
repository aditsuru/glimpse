"use client";

import * as React from "react";
import { ScrollRootContext } from "@/store/scroll-root-context";

interface ScrollContainerProps {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

/**
 * Drop-in replacement for any scrollable div.
 * Provides the scroll root to all VideoPlayer children via context,
 * so IntersectionObserver thresholds are calculated relative to THIS
 * container rather than the browser viewport.
 *
 * Replace:
 *   <div className="overflow-y-auto">
 * With:
 *   <ScrollContainer className="overflow-y-auto">
 */
export function ScrollContainer({
	children,
	className,
	style,
}: ScrollContainerProps) {
	const ref = React.useRef<HTMLDivElement>(null);
	const [el, setEl] = React.useState<HTMLElement | null>(null);

	// useLayoutEffect so the element is available before first paint
	// preventing a flash where IO briefly uses the viewport as root
	React.useLayoutEffect(() => {
		setEl(ref.current);
	}, []);

	return (
		<ScrollRootContext.Provider value={el}>
			<div ref={ref} className={className} style={style}>
				{children}
			</div>
		</ScrollRootContext.Provider>
	);
}
