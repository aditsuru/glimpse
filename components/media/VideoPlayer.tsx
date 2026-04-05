/** biome-ignore-all lint/a11y/noStaticElementInteractions: not given */
/** biome-ignore-all lint/a11y/noNoninteractiveTabindex: not given */
/** biome-ignore-all lint/a11y/useSemanticElements: not given */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: not given */
"use client";

import {
	Check,
	ChevronRight,
	Download,
	Gauge,
	Maximize,
	Pause,
	Play,
	Settings,
	Volume2,
	VolumeX,
} from "lucide-react";
import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ScrollRootContext } from "@/store/scroll-root-context";
import { useMediaStore } from "@/store/use-media-store";

const SPEEDS = [0.5, 1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

interface VideoPlayerProps {
	src: string;
	autoPlay?: boolean;
}

type MenuView = "root" | "speed";

export function VideoPlayer({ src, autoPlay = false }: VideoPlayerProps) {
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const containerRef = React.useRef<HTMLDivElement>(null);

	// --- GLOBAL STORE ---
	const isMuted = useMediaStore((state) => state.isMuted);
	const setMuted = useMediaStore((state) => state.setMuted);
	const activeVideoId = useMediaStore((state) => state.activeVideoId);
	const setActiveVideoId = useMediaStore((state) => state.setActiveVideoId);
	const scrollRoot = React.useContext(ScrollRootContext);

	// --- LOCAL STATE ---
	const [playing, setPlaying] = React.useState(false);
	const [progress, setProgress] = React.useState(0);
	const [duration, setDuration] = React.useState(0);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [hovering, setHovering] = React.useState(false);
	const [speed, setSpeed] = React.useState<Speed>(1);
	const [menuOpen, setMenuOpen] = React.useState(false);
	const [menuView, setMenuView] = React.useState<MenuView>("root");
	const [hasHydrated, setHasHydrated] = React.useState(false);
	const [inView, setInView] = React.useState(false);
	const userPaused = React.useRef(false); // Tracks if the user intentionally paused

	React.useEffect(() => {
		setHasHydrated(true);
	}, []);

	const closeMenu = React.useCallback(() => {
		setMenuOpen(false);
		setMenuView("root");
	}, []);

	// 1. Intersection Observer: Track visibility
	React.useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setInView(entry.isIntersecting);
			},
			{
				root: scrollRoot,
				rootMargin: "-15% 0px",
				threshold: 0.3,
			}
		);
		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [scrollRoot]);

	// 2. Engine: Synchronize DOM with Global Store and Visibility
	// Effect A: Intersection → claim or release the active slot
	React.useEffect(() => {
		if (!hasHydrated) return;
		const v = videoRef.current;
		if (!v) return;

		if (inView) {
			// Read live store state — avoids stale closure when two videos race
			const liveActive = useMediaStore.getState().activeVideoId;
			if (autoPlay && !liveActive && !userPaused.current) {
				setActiveVideoId(src);
				v.play().catch(() => {});
			}
		} else {
			// Leaving view: reset intent, release throne, ensure paused
			userPaused.current = false;
			if (useMediaStore.getState().activeVideoId === src) {
				setActiveVideoId(null);
			}
			if (!v.paused) v.pause();
		}
	}, [inView, hasHydrated, autoPlay, src, setActiveVideoId]);

	// Effect B: Another video claimed/released the throne — sync this video accordingly
	React.useEffect(() => {
		if (!hasHydrated) return;
		const v = videoRef.current;
		if (!v) return;

		if (activeVideoId === src) {
			if (!userPaused.current && v.paused) {
				v.play().catch(() => {});
			}
		} else if (!v.paused) {
			v.pause();
		}
	}, [activeVideoId, src, hasHydrated]);
	// 3. UI Sync: Listen to the actual Video Element events
	// This ensures the Play/Pause icon always matches reality
	const handlePlay = () => setPlaying(true);
	const handlePause = () => setPlaying(false);

	const togglePlay = () => {
		const v = videoRef.current;
		if (!v) return;

		if (v.paused) {
			userPaused.current = false;
			setActiveVideoId(src);
			v.play();
		} else {
			userPaused.current = true;
			v.pause();
			// If we manually pause, we stay active so others don't steal the slot
			// while we are still staring at this post.
		}
	};

	const formatTime = (s: number) => {
		if (Number.isNaN(s)) return "0:00";
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, "0")}`;
	};

	const toggleMute = (e: React.MouseEvent) => {
		e.stopPropagation();
		setMuted(!isMuted);
	};

	const handleTimeUpdate = () => {
		const v = videoRef.current;
		if (!v) return;
		setCurrentTime(v.currentTime);
		setProgress(v.currentTime);
	};

	const handleSeek = (value: number | readonly number[]) => {
		const v = videoRef.current;
		if (!v) return;
		const val = Array.isArray(value) ? value[0] : (value as number);
		v.currentTime = val;
		setProgress(val);
		setCurrentTime(val);
	};

	const handleSpeedChange = (s: Speed) => {
		const v = videoRef.current;
		if (!v) return;
		v.playbackRate = s;
		setSpeed(s);
		closeMenu();
	};

	const toggleFullscreen = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!document.fullscreenElement) {
			containerRef.current?.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	// --- RENDER ---
	if (!hasHydrated)
		return <div className="h-full w-full bg-black animate-pulse rounded-lg" />;

	const showControls = hovering || !playing || menuOpen;

	return (
		<div
			ref={containerRef}
			role="region"
			aria-label="Video Player"
			tabIndex={0}
			className="relative h-full w-full rounded-lg bg-black"
			onClick={togglePlay}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					togglePlay();
				}
				if (e.key === "Escape") closeMenu();
			}}
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
		>
			<video
				ref={videoRef}
				src={src}
				loop
				muted={isMuted}
				playsInline
				preload="metadata"
				onPlay={handlePlay}
				onPause={handlePause}
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={() => {
					const v = videoRef.current;
					if (v) setDuration(v.duration);
				}}
				className="h-full w-full object-contain rounded-lg overflow-hidden"
			/>

			{/* Controls overlay */}
			<div
				className={cn(
					"absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-4 pb-2 pt-12 transition-opacity duration-300",
					showControls ? "opacity-100" : "opacity-0"
				)}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				{/* Scrubber — stop pointer events reaching carousel */}
				<div onPointerDown={(e) => e.stopPropagation()}>
					<Slider
						value={[progress]}
						max={duration || 1}
						step={0.05}
						onValueChange={handleSeek}
						className="mb-2 cursor-grab active:cursor-grabbing **:data-[slot=slider-thumb]:h-3.5 **:data-[slot=slider-thumb]:w-3.5 **:data-[slot=slider-thumb]:border-0 **:data-[slot=slider-thumb]:bg-white **:data-[slot=slider-range]:bg-white **:data-[slot=slider-track]:bg-white/30"
					/>
				</div>

				<div className="flex items-center justify-between">
					{/* Left: play + timestamp */}
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="icon"
							onClick={togglePlay}
							className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10"
						>
							{playing ? <Pause size={20} /> : <Play size={20} />}
						</Button>
						<span className="tabular-nums text-sm font-medium text-white/90 ml-2">
							{formatTime(currentTime)} / {formatTime(duration)}
						</span>
					</div>

					{/* Right: mute + settings + fullscreen */}
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleMute}
							className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10"
						>
							{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
						</Button>

						{/* Custom settings menu — absolutely positioned inside the container,
						    so it's always visible in fullscreen without any portal gymnastics */}
						<div className="relative">
							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									if (menuOpen) {
										closeMenu();
									} else {
										setMenuOpen(true);
									}
								}}
								className={cn(
									buttonVariants({ variant: "ghost", size: "icon" }),
									"text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10"
								)}
							>
								<Settings size={22} />
							</Button>

							{menuOpen && (
								<div
									className="absolute bottom-10 right-4 w-58 rounded-md border bg-popover text-popover-foreground shadow-md z-50 overflow-hidden"
									onClick={(e) => e.stopPropagation()}
								>
									{menuView === "root" && (
										<div className="p-1">
											<button
												type="button"
												onClick={() => setMenuView("speed")}
												className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
											>
												<Gauge size={16} />
												<span className="flex-1 text-left">Playback speed</span>
												<span className="text-xs text-muted-foreground">
													{speed}x
												</span>
												<ChevronRight
													size={14}
													className="text-muted-foreground"
												/>
											</button>

											<div className="my-1 h-px bg-border -mx-1" />

											<button
												type="button"
												onClick={() => {
													const a = document.createElement("a");
													a.href = src;
													a.download = "video.mp4";
													a.click();
													closeMenu();
												}}
												className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
											>
												<Download size={16} />
												Download video
											</button>
										</div>
									)}

									{menuView === "speed" && (
										<div className="p-1">
											<button
												type="button"
												onClick={() => setMenuView("root")}
												className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground mb-1"
											>
												<ChevronRight size={14} className="rotate-180" />
												Speed
											</button>
											<div className="my-1 h-px bg-border -mx-1" />
											{SPEEDS.map((s) => (
												<button
													key={s}
													type="button"
													onClick={() => handleSpeedChange(s)}
													className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
												>
													{s === 1 ? "Normal" : `${s}x`}
													{s === speed && <Check size={14} />}
												</button>
											))}
										</div>
									)}
								</div>
							)}
						</div>

						<Button
							variant="ghost"
							size="icon"
							onClick={toggleFullscreen}
							className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10"
						>
							<Maximize size={18} />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
