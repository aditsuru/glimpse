"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollRootContext } from "@/store/scroll-root-context";

export function ScrollContainer({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const ref = React.useRef<HTMLDivElement>(null);
	const [el, setEl] = React.useState<HTMLElement | null>(null);

	React.useLayoutEffect(() => {
		setEl(ref.current);
	}, []);

	return (
		<ScrollRootContext.Provider value={el}>
			<div ref={ref} className={cn("overflow-y-auto", className)}>
				{children}
			</div>
		</ScrollRootContext.Provider>
	);
}
