"use client";

import { useState } from "react";

// ─── Playlist config ──────────────────────────────────────────────────────────
const TRENDING_REPEATS = 1;
const TRENDING_PER_CYCLE = 1;

interface BillboardVideoProps {
	trendingVideos: string[];
	timeBreakVideos: string[];
}

export const BillboardVideo = ({
	trendingVideos,
	timeBreakVideos,
}: BillboardVideoProps) => {
	const [trendingIdx, setTrendingIdx] = useState(0);
	const [timeBreakIdx, setTimeBreakIdx] = useState(0);
	const [repeat, setRepeat] = useState(0);
	const [cyclePos, setCyclePos] = useState(0);
	const [phase, setPhase] = useState<"trending" | "timebreak">("trending");

	const [videoKey, setVideoKey] = useState(0);
	const bump = () => setVideoKey((k) => k + 1);

	const currentSrc =
		phase === "trending"
			? trendingVideos[trendingIdx % trendingVideos.length]
			: timeBreakVideos[timeBreakIdx % timeBreakVideos.length];

	const handleEnded = () => {
		if (phase === "trending") {
			const nextRepeat = repeat + 1;

			if (nextRepeat < TRENDING_REPEATS) {
				setRepeat(nextRepeat);
				bump();
				return;
			}

			setRepeat(0);
			setTrendingIdx((i) => i + 1);

			const nextCyclePos = cyclePos + 1;
			if (nextCyclePos >= TRENDING_PER_CYCLE) {
				setCyclePos(0);
				setPhase("timebreak");
			} else {
				setCyclePos(nextCyclePos);
			}
			bump();
		} else {
			// One break video per cycle — advance index for next cycle, return to trending
			setTimeBreakIdx((i) => (i + 1) % timeBreakVideos.length);
			setPhase("trending");
			bump();
		}
	};

	return (
		<figure aria-label="Billboard video">
			<video
				key={videoKey}
				src={currentSrc}
				autoPlay
				muted
				playsInline
				onEnded={handleEnded}
				style={{
					width: "100%",
					height: "100%",
					objectFit: "cover",
					objectPosition: "center",
					display: "block",
				}}
			/>
		</figure>
	);
};
