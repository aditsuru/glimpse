"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const ProgressBar = () => {
	const [progress, setProgress] = useState(0);
	const [visible, setVisible] = useState(false);
	const interval = useRef<ReturnType<typeof setInterval> | null>(null);
	const fadeOut = useRef<ReturnType<typeof setTimeout> | null>(null);
	const reset = useRef<ReturnType<typeof setTimeout> | null>(null);

	const pathname = usePathname();
	const searchParams = useSearchParams();
	const routeRef = useRef(`${pathname}?${searchParams}`);

	const complete = () => {
		if (interval.current) clearInterval(interval.current);
		if (fadeOut.current) clearTimeout(fadeOut.current);
		if (reset.current) clearTimeout(reset.current);

		setProgress(100);
		fadeOut.current = setTimeout(() => setVisible(false), 300);
		reset.current = setTimeout(() => setProgress(0), 600);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: route change detection via ref comparison
	useEffect(() => {
		const current = `${pathname}?${searchParams}`;
		if (routeRef.current === current) return;
		routeRef.current = current;
		complete();
	}, [pathname, searchParams]);

	useEffect(() => {
		const start = () => {
			if (interval.current) clearInterval(interval.current);
			if (fadeOut.current) clearTimeout(fadeOut.current);
			if (reset.current) clearTimeout(reset.current);

			setVisible(true);
			setProgress(10);

			let cur = 10;
			interval.current = setInterval(() => {
				cur += Math.random() * 10 * (1 - cur / 100);
				if (cur > 90) cur = 90;
				setProgress(cur);
			}, 300);
		};

		window.addEventListener("startProgress", start);
		return () => window.removeEventListener("startProgress", start);
	}, []);

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				height: "3px",
				zIndex: 99999,
				pointerEvents: "none",
				opacity: visible ? 1 : 0,
				transition: "opacity 300ms ease",
			}}
		>
			<div
				style={{
					height: "100%",
					width: `${progress}%`,
					background: "#1447e6",
					boxShadow: "0 0 8px #1447e6",
					transition: "width 300ms ease",
				}}
			/>
		</div>
	);
};
