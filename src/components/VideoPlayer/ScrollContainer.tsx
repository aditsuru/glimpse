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

export const ScrollContainer = React.forwardRef<
	HTMLDivElement,
	ScrollContainerProps
>(
	(
		{ children, className, style, scrollKey, onScroll, ...props },
		forwardedRef
	) => {
		const innerRef = React.useRef<HTMLDivElement>(null);
		const [el, setEl] = React.useState<HTMLElement | null>(null);

		React.useImperativeHandle(
			forwardedRef,
			() => innerRef.current as HTMLDivElement
		);

		React.useLayoutEffect(() => {
			setEl(innerRef.current);

			if (scrollKey && innerRef.current) {
				const saved = sessionStorage.getItem(`scroll-${scrollKey}`);
				if (saved) {
					requestAnimationFrame(() => {
						if (innerRef.current) innerRef.current.scrollTop = Number(saved);
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
					ref={innerRef}
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
);

ScrollContainer.displayName = "ScrollContainer";
