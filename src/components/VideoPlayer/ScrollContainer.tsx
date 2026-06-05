"use client";

import * as React from "react";
import { useDebouncedCallback } from "use-debounce";
import { ScrollRootContext } from "./VideoPlayer";

interface ScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	scrollKey?: string;
}

export function ScrollContainer({
	children,
	className,
	style,
	scrollKey,
	onScroll,
	...props
}: ScrollContainerProps) {
	const ref = React.useRef<HTMLDivElement>(null);
	const [el, setEl] = React.useState<HTMLElement | null>(null);

	React.useLayoutEffect(() => {
		setEl(ref.current);

		if (scrollKey && ref.current) {
			const saved = sessionStorage.getItem(`scroll-${scrollKey}`);
			if (saved) {
				requestAnimationFrame(() => {
					if (ref.current) ref.current.scrollTop = Number(saved);
				});
			}
		}
	}, [scrollKey]);

	const saveScroll = useDebouncedCallback((top: number) => {
		if (scrollKey) {
			sessionStorage.setItem(`scroll-${scrollKey}`, top.toString());
		}
	}, 150);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		saveScroll(e.currentTarget.scrollTop);
		if (onScroll) onScroll(e);
	};

	return (
		<ScrollRootContext.Provider value={el}>
			<div
				ref={ref}
				className={className}
				style={style}
				onScroll={handleScroll}
				{...props}
			>
				{children}
			</div>
		</ScrollRootContext.Provider>
	);
}
