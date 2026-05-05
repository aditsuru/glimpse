/** biome-ignore-all lint/a11y/noStaticElementInteractions: video player container needs click/key handlers */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: onKeyDown is present on the container */
/** biome-ignore-all lint/a11y/noNoninteractiveTabindex: video player needs focus for keyboard controls */
"use client";

/**
 * VideoPlayer
 *
 * A fully self-contained video player primitive with global single-active-video
 * coordination, scroll-aware autoplay, spoiler mode, and custom controls.
 *
 * Props:
 *   src          — Video URL
 *   autoPlay     — Autoplay when 60% visible in scroll container (default: false)
 *                  Spoiler mode blocks autoplay until the user reveals the video.
 *   spoiler      — Blurs video and shows reveal overlay (default: false)
 *   aspectRatio  — CSS aspect-ratio number e.g. 16/9. If omitted, fills parent height.
 *   className    — Extra classes on the outermost wrapper
 *
 * Requires (copy to your project):
 *   @/store/use-media-store       ← useMediaStore
 *   @/store/scroll-root-context   ← ScrollRootContext
 *
 * Autoplay mechanics:
 *   - One video plays at a time across the entire app (via zustand activeVideoId).
 *   - IntersectionObserver with ScrollRootContext as root fires at 60% visibility.
 *   - userPaused ref: prevents autoplay reclaiming after manual pause.
 *   - autoplayFailed ref: prevents infinite retry loop when browser blocks autoplay.
 *     Resets on: leaving viewport, manual play click (user gesture unlocks browser).
 *   - Store subscription is imperative (not reactive) to avoid render-cycle lag
 *     when another video claims the slot and this one must pause immediately.
 */

import { Slider } from "@base-ui/react/slider";
import {
	Check,
	ChevronRight,
	Download,
	Eye,
	EyeOff,
	Gauge,
	Maximize,
	Minimize,
	Pause,
	Play,
	Settings,
	Volume1,
	Volume2,
	VolumeX,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/client/utils";
import { useMediaStore } from "@/store/use-media-store";

// ─── Types ────────────────────────────────────────────────────────────────────

const SPEEDS = [0.5, 1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];
type MenuView = "root" | "speed";

export interface VideoPlayerProps {
	src: string;
	autoPlay?: boolean;
	spoiler?: boolean;
	aspectRatio?: number;
	className?: string;
	autoPlayThreshold?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number): string {
	if (!Number.isFinite(s) || Number.isNaN(s) || s < 0) return "0:00";
	const m = Math.floor(s / 60);
	const sec = Math.floor(s % 60);
	return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Provides the scroll container element to VideoPlayer's IntersectionObserver.
 * Without this, IO uses the viewport as root — videos inside overflow containers
 * will autoplay/autopause at the wrong time.
 *
 * Usage: wrap every scrollable container with <ScrollContainer>.
 */
export const ScrollRootContext = React.createContext<HTMLElement | null>(null);

interface VideoSliderProps {
	value: number;
	max: number;
	step: number;
	onValueChange: (val: number) => void;
	className?: string;
}

function VideoSlider({
	value,
	max,
	step,
	onValueChange,
	className,
}: VideoSliderProps) {
	return (
		<Slider.Root
			className={`relative flex touch-none select-none items-center ${className ?? ""}`}
			min={0}
			max={max}
			step={step}
			value={value} // ← plain number
			onValueChange={(val) => {
				onValueChange(Array.isArray(val) ? (val[0] ?? 0) : val); // ← handle both
			}}
		>
			<Slider.Control className="w-full flex items-center">
				{" "}
				<Slider.Track className="relative h-[5px] w-full grow overflow-hidden rounded-full bg-white/25">
					<Slider.Indicator className="absolute h-full rounded-full bg-white" />
					<Slider.Thumb
						aria-label="Slider"
						className="block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform hover:scale-125 focus-visible:outline-none disabled:pointer-events-none"
					/>
				</Slider.Track>
			</Slider.Control>
		</Slider.Root>
	);
}

interface ScrubberProps {
	value: number;
	max: number;
	onValueChange: (val: number) => void;
}

function Scrubber({ value, max, onValueChange }: ScrubberProps) {
	return (
		<div onPointerDown={(e) => e.stopPropagation()} className="w-full px-0.5">
			<VideoSlider
				value={value}
				max={max || 1}
				step={0.05}
				onValueChange={onValueChange}
				className="w-full"
			/>
		</div>
	);
}

interface VolumeControlProps {
	volume: number;
	isMuted: boolean;
	onVolumeChange: (val: number) => void;
	onToggleMute: () => void;
}

function VolumeControl({
	volume,
	isMuted,
	onVolumeChange,
	onToggleMute,
}: VolumeControlProps) {
	const Icon =
		isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

	return (
		// group/volume — the slider expands on hover of the whole group
		<div
			className="flex items-center gap-1 group/volume"
			onPointerDown={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onToggleMute();
				}}
				className="text-white p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
				aria-label={isMuted ? "Unmute" : "Mute"}
			>
				<Icon size={20} />
			</button>

			{/* Expands on group hover — width transition via Tailwind */}
			<div className="overflow-hidden w-0 group-hover/volume:w-18 transition-all duration-200 flex items-center">
				<VideoSlider
					value={volume}
					max={1}
					step={0.02}
					onValueChange={onVolumeChange}
					className="w-18"
				/>
			</div>
		</div>
	);
}

interface SettingsMenuProps {
	open: boolean;
	view: MenuView;
	speed: Speed;
	onToggle: () => void;
	onViewChange: (v: MenuView) => void;
	onSpeedChange: (s: Speed) => void;
	onDownload: () => void;
}

function SettingsMenu({
	open,
	view,
	speed,
	onToggle,
	onViewChange,
	onSpeedChange,
	onDownload,
}: SettingsMenuProps) {
	return (
		<div className="relative">
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onToggle();
				}}
				className="text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
				aria-label="Settings"
				aria-expanded={open}
			>
				<Settings size={20} />
			</button>

			{open && (
				<div
					className="absolute bottom-10 right-0 w-64 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl text-white text-sm shadow-2xl z-50 overflow-hidden"
					onClick={(e) => e.stopPropagation()}
				>
					{view === "root" && (
						<div className="p-1">
							<button
								type="button"
								onClick={() => onViewChange("speed")}
								className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
							>
								<Gauge size={14} className="text-white/50 shrink-0" />
								<span className="flex-1 text-left">Playback speed</span>
								<span className="text-xs text-white/40">
									{speed === 1 ? "Normal" : `${speed}x`}
								</span>
								<ChevronRight size={13} className="text-white/30 shrink-0" />
							</button>

							<div className="my-1 h-px bg-white/10" />

							<button
								type="button"
								onClick={onDownload}
								className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
							>
								<Download size={14} className="text-white/50 shrink-0" />
								Download
							</button>
						</div>
					)}

					{view === "speed" && (
						<div className="p-1">
							<button
								type="button"
								onClick={() => onViewChange("root")}
								className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-white/50 hover:bg-white/10 transition-colors"
							>
								<ChevronRight size={13} className="rotate-180 shrink-0" />
								<span>Playback speed</span>
							</button>

							<div className="my-1 h-px bg-white/10" />

							{SPEEDS.map((s) => (
								<button
									key={s}
									type="button"
									onClick={() => onSpeedChange(s)}
									className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
								>
									<span>{s === 1 ? "Normal" : `${s}x`}</span>
									{s === speed && <Check size={13} className="text-white/60" />}
								</button>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function VideoPlayer({
	src,
	autoPlay = false,
	spoiler = false,
	aspectRatio = 16 / 9,
	className = "",
	autoPlayThreshold = 0.8,
}: VideoPlayerProps) {
	// ── Refs (never trigger re-renders) ─────────────────────────────────────────
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const containerRef = React.useRef<HTMLDivElement>(null);

	/**
	 * userPaused: user explicitly hit pause.
	 * Prevents the slot-freed path in Engine 2 from instantly re-claiming
	 * the active slot and restarting a video the user intentionally stopped.
	 * Reset on: leaving viewport, manual play click.
	 */
	const userPaused = React.useRef(false);

	/**
	 * inViewRef: synchronous visibility state for Engine 2's slot-freed path.
	 * React state would be stale inside the zustand subscription closure.
	 */
	const inViewRef = React.useRef(false);

	/**
	 * autoplayFailed: browser blocked play() (e.g. no user interaction yet).
	 * Prevents an infinite retry loop:
	 *   slot freed → try to play → browser blocks → slot freed → ...
	 * Reset on: leaving viewport (fresh chance next time), manual play (gesture unlocks browser).
	 */
	const autoplayFailed = React.useRef(false);

	// ── Store ────────────────────────────────────────────────────────────────────
	const isMuted = useMediaStore((s) => s.isMuted);
	const volume = useMediaStore((s) => s.volume);
	const setMuted = useMediaStore((s) => s.setMuted);
	const setVolume = useMediaStore((s) => s.setVolume);
	const setActiveVideoId = useMediaStore((s) => s.setActiveVideoId);

	// ── Scroll root ──────────────────────────────────────────────────────────────
	const scrollRoot = React.useContext(ScrollRootContext);

	// ── UI state ─────────────────────────────────────────────────────────────────
	const [playing, setPlaying] = React.useState(false);
	const [duration, setDuration] = React.useState(0);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [hovering, setHovering] = React.useState(false);
	const [speed, setSpeed] = React.useState<Speed>(1);
	const [menuOpen, setMenuOpen] = React.useState(false);
	const [menuView, setMenuView] = React.useState<MenuView>("root");
	const [isFullscreen, setIsFullscreen] = React.useState(false);

	/**
	 * spoilerRevealed: local — not global, not persisted.
	 * Each VideoPlayer instance manages its own spoiler state independently.
	 * Initialized to true when spoiler=false (no overlay needed).
	 */
	const [spoilerRevealed, setSpoilerRevealed] = React.useState(!spoiler);

	const showSpoiler = spoiler && !spoilerRevealed;

	// Video ID
	const videoId = `${React.useId()}-${src}`;

	// ── On unmount: release active slot ─────────────────────────────────────────
	// CRITICAL: prevents a destroyed video from permanently holding the global slot,
	// blocking all other videos from autoplaying after a page transition.
	React.useEffect(() => {
		return () => {
			if (useMediaStore.getState().activeVideoId === videoId) {
				useMediaStore.getState().setActiveVideoId(null);
			}
		};
	}, [videoId]);

	// ── Sync video element with store values ─────────────────────────────────────
	// Runs whenever the user changes mute/volume from ANY other video instance.
	React.useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		v.muted = isMuted;
		v.volume = volume;
	}, [isMuted, volume]);

	// ── Duration: handle pre-loaded video (readyState already >= 1 on mount) ─────
	React.useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		if (v.readyState >= 1 && Number.isFinite(v.duration) && v.duration > 0) {
			setDuration(v.duration);
		}
	}, []);

	// ── Reset speed when src changes ─────────────────────────────────────────────
	// biome-ignore lint/correctness/useExhaustiveDependencies: src is a trigger dep, not used inside
	React.useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		v.playbackRate = 1;
		setSpeed(1);
		setCurrentTime(0);
	}, [src]);

	// ── Fullscreen change listener ────────────────────────────────────────────────
	React.useEffect(() => {
		const handler = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener("fullscreenchange", handler);
		return () => document.removeEventListener("fullscreenchange", handler);
	}, []);

	// ── safePlay ─────────────────────────────────────────────────────────────────
	// Always reads CURRENT store state (not closure) to avoid stale muted/volume.
	const safePlay = React.useCallback(() => {
		const v = videoRef.current;
		if (!v || autoplayFailed.current) return;

		// Read latest store values imperatively — closures would be stale
		const { isMuted: muted, volume: vol } = useMediaStore.getState();
		v.muted = muted;
		v.volume = vol;

		v.play().catch((err) => {
			console.warn("[VideoPlayer] Autoplay blocked by browser:", err);
			autoplayFailed.current = true;
			// Release the slot so other videos aren't permanently blocked
			if (useMediaStore.getState().activeVideoId === videoId) {
				useMediaStore.getState().setActiveVideoId(null);
			}
		});
	}, [videoId]);

	// ── Engine 1: IntersectionObserver ───────────────────────────────────────────
	// Fires directly in the callback — no state, no render cycle.
	// Uses scrollRoot from context so it works correctly inside overflow containers
	// (profile tabs, modal sheets, etc.) without manual wiring.
	React.useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				const v = videoRef.current;
				if (!v) return;

				if (document.fullscreenElement) return;

				inViewRef.current = entry.isIntersecting;

				if (entry.isIntersecting) {
					// Only claim the slot if:
					// - autoPlay is enabled
					// - spoiler has been revealed (or was never shown)
					// - nothing else is playing
					// - user hasn't manually paused this video
					if (
						autoPlay &&
						spoilerRevealed &&
						!useMediaStore.getState().activeVideoId &&
						!userPaused.current &&
						!useMediaStore.getState().isPausedGlobally
					) {
						setActiveVideoId(videoId);
						safePlay();
					}
				} else {
					// Leaving viewport: clean up completely.
					// Reset userPaused so next entry starts fresh (scroll back down = re-autoplay)
					// Reset autoplayFailed so the browser gets another chance next time
					userPaused.current = false;
					autoplayFailed.current = false;

					if (useMediaStore.getState().activeVideoId === videoId) {
						setActiveVideoId(null);
					}
					if (!v.paused) v.pause();
				}
			},
			{
				root: scrollRoot, // null = viewport (works fine for top-level scroll)
				threshold: autoPlayThreshold,
			}
		);

		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [
		scrollRoot,
		videoId,
		autoPlay,
		spoilerRevealed,
		setActiveVideoId,
		safePlay,
		autoPlayThreshold,
	]);

	// ── Engine 2: Store subscription ─────────────────────────────────────────────
	// Imperative reaction to activeVideoId changes.
	// Does NOT use React state because by the time a re-render fires, the
	// currently-playing video would have already played for several frames.
	React.useEffect(() => {
		return useMediaStore.subscribe((state) => {
			const v = videoRef.current;
			if (!v) return;

			if (state.activeVideoId === videoId) {
				// We were explicitly given the slot — play if not already
				if (!userPaused.current && v.paused) {
					safePlay();
				}
			} else if (
				// Slot was freed (another video stopped/left view).
				// Reclaim if: we're in view, autoPlay on, spoiler resolved,
				// user hasn't paused, and browser hasn't permanently blocked us.
				state.activeVideoId === null &&
				inViewRef.current &&
				autoPlay &&
				spoilerRevealed &&
				!userPaused.current &&
				!autoplayFailed.current && // ← THE LOOP GUARD — without this, failed autoplay → release → re-try → loop
				!useMediaStore.getState().isPausedGlobally
			) {
				// Double-check getState() in case two subscribers fire simultaneously
				if (!useMediaStore.getState().activeVideoId) {
					setActiveVideoId(videoId);
					safePlay();
				}
			} else if (!v.paused) {
				// Someone else claimed the slot — yield immediately
				v.pause();
			}
		});
	}, [videoId, autoPlay, spoilerRevealed, setActiveVideoId, safePlay]);

	// ── Controls ─────────────────────────────────────────────────────────────────

	const togglePlay = () => {
		const v = videoRef.current;
		if (!v) return;

		if (v.paused) {
			// Manual play: reset both flags — user gesture unlocks browser autoplay block
			userPaused.current = false;
			autoplayFailed.current = false;
			setActiveVideoId(videoId);
			safePlay();
		} else {
			userPaused.current = true;
			v.pause();
		}
	};

	const handleTimeUpdate = () => {
		const v = videoRef.current;
		if (!v) return;
		setCurrentTime(v.currentTime);
	};

	const handleScrub = (val: number) => {
		const v = videoRef.current;
		if (!v) return;
		v.currentTime = val;
		setCurrentTime(val);
	};

	const handleVolumeChange = (val: number) => {
		setVolume(val);
		// Auto-mute when dragged to 0, auto-unmute when dragged above 0
		if (val === 0) setMuted(true);
		else if (isMuted) setMuted(false);
	};

	const handleToggleMute = () => {
		if (isMuted) {
			// We are UNMUTING — restore volume if it was dragged to zero
			if (volume === 0) setVolume(0.5);
			setMuted(false);
		} else {
			// We are MUTING — just mute, leave volume alone
			setMuted(true);
		}
	};

	const handleSpeedChange = (s: Speed) => {
		const v = videoRef.current;
		if (!v) return;
		v.playbackRate = s;
		setSpeed(s);
		setMenuView("root");
		setMenuOpen(false);
	};

	const handleToggleFullscreen = () => {
		if (!document.fullscreenElement) {
			containerRef.current?.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	const handleDownload = () => {
		const a = document.createElement("a");
		a.href = src;
		a.download = "video.mp4";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setMenuOpen(false);
	};

	const handleRevealSpoiler = () => {
		setSpoilerRevealed(true);
		// After reveal, video behaves as a normal autoPlay video if autoPlay=true.
		// Engine 1 & 2 will handle the rest since spoilerRevealed is now true.
	};

	const handleMenuToggle = () => {
		setMenuOpen((o) => !o);
		if (menuOpen) setMenuView("root");
	};

	const showControls = hovering || !playing || menuOpen;

	// ── Render ────────────────────────────────────────────────────────────────────

	const wrapperStyle: React.CSSProperties = aspectRatio
		? { aspectRatio: aspectRatio }
		: {};

	return (
		<section
			ref={containerRef}
			className={cn(
				"relative w-full bg-black rounded-lg overflow-hidden select-none",
				className
			)}
			style={wrapperStyle}
			aria-label="Video player"
			tabIndex={0}
			onClick={showSpoiler ? undefined : togglePlay}
			onKeyDown={(e) => {
				if (showSpoiler) return;
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					togglePlay();
				}
				if (e.key === "Escape") {
					setMenuOpen(false);
					setMenuView("root");
				}
				if (e.key === "ArrowRight") {
					const v = videoRef.current;
					if (v) v.currentTime = Math.min(v.currentTime + 5, v.duration);
				}
				if (e.key === "ArrowLeft") {
					const v = videoRef.current;
					if (v) v.currentTime = Math.max(v.currentTime - 5, 0);
				}
				if (e.key === "m" || e.key === "M") handleToggleMute();
				if (e.key === "f" || e.key === "F") handleToggleFullscreen();
			}}
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => {
				setHovering(false);
				setMenuOpen(false);
				setMenuView("root");
			}}
		>
			{/* ── Video element ─────────────────────────────────────────────────────── */}
			<video
				ref={videoRef}
				src={src}
				loop
				muted={isMuted}
				playsInline
				preload="metadata"
				className="w-full h-full object-contain"
				style={{
					filter: showSpoiler
						? "blur(40px) brightness(0.6) saturate(0.6)"
						: "none",
					transition: "filter 0.3s ease",
				}}
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onTimeUpdate={handleTimeUpdate}
				onDurationChange={() => {
					const v = videoRef.current;
					if (v && Number.isFinite(v.duration) && v.duration > 0) {
						setDuration(v.duration);
					}
				}}
				onLoadedMetadata={() => {
					const v = videoRef.current;
					if (v && Number.isFinite(v.duration) && v.duration > 0) {
						setDuration(v.duration);
					}
				}}
			/>

			{/* ── Spoiler overlay ───────────────────────────────────────────────────── */}
			{showSpoiler && (
				<div
					className="absolute inset-0 z-20 flex items-center justify-center"
					onClick={(e) => {
						e.stopPropagation();
						handleRevealSpoiler();
					}}
				>
					<div className="flex flex-col items-center text-white pointer-events-none">
						<div className="backdrop-blur-sm">
							<Eye size={30} strokeWidth={1.5} />
						</div>
						<div className="text-center space-y-0.5">
							<p className="text-sm font-semibold tracking-wide">
								View spoiler
							</p>
						</div>
					</div>
				</div>
			)}

			{/* ── Controls overlay ──────────────────────────────────────────────────── */}
			{!showSpoiler && (
				<div
					className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 pointer-events-none ${
						showControls ? "opacity-100" : "opacity-0"
					}`}
				>
					{/* Gradient scrim — fades from transparent to dark at the bottom */}
					<div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />

					{/* Spoiler re-hide button — top left, only when spoiler prop is true */}
					{spoiler && spoilerRevealed && !isFullscreen && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								setSpoilerRevealed(false);
								userPaused.current = true;
								const v = videoRef.current;
								if (v && !v.paused) v.pause();
								if (useMediaStore.getState().activeVideoId === videoId) {
									useMediaStore.getState().setActiveVideoId(null);
								}
							}}
							className="absolute top-2 left-2 z-10 text-white p-1.5 rounded-full hover:bg-white/10 transition-colors pointer-events-auto"
							aria-label="Hide spoiler"
						>
							<EyeOff size={20} />
						</button>
					)}

					{/* Control bar — re-enable pointer events here only */}
					<div
						className="relative z-10 px-3 pb-2.5 pt-10 flex flex-col gap-1.5 pointer-events-auto"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Scrubber */}
						<div className="mb-1">
							<Scrubber
								value={currentTime}
								max={duration}
								onValueChange={handleScrub}
							/>
						</div>

						{/* Bottom row */}
						<div className="flex items-center justify-between gap-1">
							{/* Left cluster: play + volume + timestamp */}
							<div className="flex items-center gap-0.5">
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										togglePlay();
									}}
									className="text-white p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
									aria-label={playing ? "Pause" : "Play"}
								>
									{playing ? (
										<Pause size={20} fill="white" strokeWidth={0} />
									) : (
										<Play size={20} fill="white" strokeWidth={0} />
									)}
								</button>

								<VolumeControl
									volume={volume}
									isMuted={isMuted}
									onVolumeChange={handleVolumeChange}
									onToggleMute={handleToggleMute}
								/>

								<span className="text-white/80 tabular-nums ml-1.5 shrink-0 font-medium">
									{formatTime(currentTime)}
									<span className="text-white/40 mx-0.5">/</span>
									{formatTime(duration)}
								</span>
							</div>

							{/* Right cluster: settings + fullscreen */}
							<div className="flex items-center gap-0.5">
								<SettingsMenu
									open={menuOpen}
									view={menuView}
									speed={speed}
									onToggle={handleMenuToggle}
									onViewChange={setMenuView}
									onSpeedChange={handleSpeedChange}
									onDownload={handleDownload}
								/>

								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleToggleFullscreen();
									}}
									className="text-white p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
									aria-label={
										isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
									}
								>
									{isFullscreen ? (
										<Minimize size={20} />
									) : (
										<Maximize size={20} />
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
