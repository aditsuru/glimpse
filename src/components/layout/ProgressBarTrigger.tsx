"use client";

import { useEffect } from "react";

export const ProgressBarTrigger = () => {
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			const target = (e.target as HTMLElement).closest("a");
			if (!target) return;
			const href = target.getAttribute("href");
			if (!href?.startsWith("/") || href.startsWith("//")) return;

			const clickedUrl = new URL(href, window.location.origin);
			const isSameRoute =
				clickedUrl.pathname === window.location.pathname &&
				clickedUrl.search === window.location.search;

			if (!isSameRoute) {
				window.dispatchEvent(new Event("startProgress"));
			}
		};
		document.addEventListener("click", handleClick);
		return () => document.removeEventListener("click", handleClick);
	}, []);
	return null;
};
