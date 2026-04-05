// components/media/VideoPlayer.tsx
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
	// Refs — never cause re-renders, safe to read inside callbacks
	const userPaused = React.useRef(false);
	const inViewRef = React.useRef(false);
	const autoplayFailed = React.useRef(false); // Tracks if browser strictly blocked autoplay

	const scrollRoot = React.useContext(ScrollRootContext);

	// CRITICAL: Release the global lock if this component unmounts while active.
	// Fixes "no sync across scroll containers/pages" where a destroyed video holds the lock.
	React.useEffect(() => {
		return () => {
			if (useMediaStore.getState().activeVideoId === src) {
				useMediaStore.getState().setActiveVideoId(null);
			}
		};
	}, [src]);

	// Only subscribe to isMuted from the store — it's the only store value that drives UI
	const isMuted = useMediaStore((state) => state.isMuted);
	const setMuted = useMediaStore((state) => state.setMuted);
	const setActiveVideoId = useMediaStore((state) => state.setActiveVideoId);

	// Pure UI state — nothing here affects play/pause logic
	const [playing, setPlaying] = React.useState(false);
	const [progress, setProgress] = React.useState(0);
	const [duration, setDuration] = React.useState(0);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [hovering, setHovering] = React.useState(false);
	const [speed, setSpeed] = React.useState<Speed>(1);
	const [menuOpen, setMenuOpen] = React.useState(false);
	const [menuView, setMenuView] = React.useState<MenuView>("root");

	const closeMenu = React.useCallback(() => {
		setMenuOpen(false);
		setMenuView("root");
	}, []);

	// Safely plays the video, enforcing DOM sync to bypass React's render delay.
	const safePlay = React.useCallback(() => {
		const v = videoRef.current;
		if (!v) return;

		// Force DOM to recognize mute state before playing.
		// Fixes the "first render won't autoplay" browser policy block.
		v.muted = useMediaStore.getState().isMuted;

		v.play().catch((e) => {
			console.warn("Autoplay blocked by browser:", e);
			autoplayFailed.current = true;
			// If we fail to play, we MUST release the lock so we don't stall the whole app
			if (useMediaStore.getState().activeVideoId === src) {
				useMediaStore.getState().setActiveVideoId(null);
			}
		});
	}, [src]);

	// ─── Engine 1: Intersection Observer ──────────────────────────────────────
	// Acts directly in the callback — no state intermediary, no render cycle lag.
	React.useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				const v = videoRef.current;
				if (!v) return;

				inViewRef.current = entry.isIntersecting;

				if (entry.isIntersecting) {
					// Only claim if nobody else is playing and user hasn't manually paused
					if (
						autoPlay &&
						!useMediaStore.getState().activeVideoId &&
						!userPaused.current
					) {
						setActiveVideoId(src);
						v.muted = useMediaStore.getState().isMuted; // Force hardware mute state instantly
						v.play().catch(() => {});
					}
				} else {
					// Leaving view: reset intents, release slot, stop
					userPaused.current = false;
					autoplayFailed.current = false; // Reset block status for next time it enters view
					if (useMediaStore.getState().activeVideoId === src) {
						setActiveVideoId(null);
					}
					if (!v.paused) v.pause();
				}
			},
			{ root: scrollRoot, threshold: 0.6 }
		);

		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [scrollRoot, src, autoPlay, setActiveVideoId]);

	// ─── Engine 2: Store Subscription ─────────────────────────────────────────
	// Reacts to another video claiming or releasing the active slot.
	// Bypasses React render cycle entirely — runs imperatively on store change.
	React.useEffect(() => {
		return useMediaStore.subscribe((state) => {
			const v = videoRef.current;
			if (!v) return;

			if (state.activeVideoId === src) {
				// We are now active — play unless user intentionally paused
				if (!userPaused.current && v.paused) {
					v.muted = state.isMuted; // Force hardware mute state instantly
					v.play().catch(() => {});
				}
			} else if (
				state.activeVideoId === null &&
				inViewRef.current &&
				autoPlay &&
				!userPaused.current
			) {
				// Slot just freed — claim it if still in view.
				// Re-read live state to prevent double-claim race when
				// multiple videos are visible and both subscribers fire.
				if (!useMediaStore.getState().activeVideoId) {
					setActiveVideoId(src);
					v.muted = state.isMuted; // Force hardware mute state instantly
					v.play().catch(() => {});
				}
			} else if (!v.paused) {
				// Someone else is active — yield
				v.pause();
			}
		});
	}, [src, autoPlay, setActiveVideoId]);

	React.useEffect(() => {
		const v = videoRef.current;
		if (!v) return;

		// If metadata is already loaded, sync duration immediately
		if (v.readyState >= 1 && v.duration) {
			setDuration(v.duration);
		}
	}, []);

	// ─── Manual controls ──────────────────────────────────────────────────────
	const togglePlay = () => {
		const v = videoRef.current;
		if (!v) return;
		if (v.paused) {
			userPaused.current = false;
			setActiveVideoId(src);
			v.muted = useMediaStore.getState().isMuted;
			v.play().catch(() => {});
		} else {
			userPaused.current = true;
			v.pause();
			// Keep active slot claimed — prevents other videos from stealing
			// the slot while the user is still looking at this post
		}
	};

	const formatTime = (s: number) => {
		if (Number.isNaN(s) || !Number.isFinite(s)) return "0:00";
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
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onTimeUpdate={handleTimeUpdate}
				onDurationChange={() => {
					const v = videoRef.current;
					if (v && !Number.isNaN(v.duration)) setDuration(v.duration);
				}}
				onLoadedMetadata={() => {
					const v = videoRef.current;
					if (v && !Number.isNaN(v.duration)) setDuration(v.duration);
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
