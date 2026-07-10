/** biome-ignore-all lint/a11y/noStaticElementInteractions: video player container needs click/key handlers */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: onKeyDown is present on the container */
/** biome-ignore-all lint/a11y/noNoninteractiveTabindex: video player needs focus for keyboard controls */
"use client";

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

function formatTime(s: number): string {
	if (!Number.isFinite(s) || Number.isNaN(s) || s < 0) return "0:00";
	const m = Math.floor(s / 60);
	const sec = Math.floor(s % 60);
	return `${m}:${sec.toString().padStart(2, "0")}`;
}

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
			value={value}
			onValueChange={(val) => {
				onValueChange(Array.isArray(val) ? (val[0] ?? 0) : val);
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

export function VideoPlayer({
	src,
	autoPlay = false,
	spoiler = false,
	aspectRatio = 16 / 9,
	className = "",
	autoPlayThreshold = 0.6,
}: VideoPlayerProps) {
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const containerRef = React.useRef<HTMLDivElement>(null);

	const userPaused = React.useRef(false);

	const inViewRef = React.useRef(false);

	const autoplayFailed = React.useRef(false);

	const isMuted = useMediaStore((s) => s.isMuted);
	const volume = useMediaStore((s) => s.volume);
	const setMuted = useMediaStore((s) => s.setMuted);
	const setVolume = useMediaStore((s) => s.setVolume);
	const setActiveVideoId = useMediaStore((s) => s.setActiveVideoId);

	const scrollRoot = React.useContext(ScrollRootContext);

	const [playing, setPlaying] = React.useState(false);
	const [duration, setDuration] = React.useState(0);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [hovering, setHovering] = React.useState(false);
	const [speed, setSpeed] = React.useState<Speed>(1);
	const [menuOpen, setMenuOpen] = React.useState(false);
	const [menuView, setMenuView] = React.useState<MenuView>("root");
	const [isFullscreen, setIsFullscreen] = React.useState(false);
	const hideTimer = React.useRef<ReturnType<typeof setTimeout>>(null);
	const [controlsVisible, setControlsVisible] = React.useState(false);

	const [spoilerRevealed, setSpoilerRevealed] = React.useState(!spoiler);

	const flashControls = () => {
		setControlsVisible(true);
		if (hideTimer.current) clearTimeout(hideTimer.current);
		hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
	};

	React.useEffect(() => {
		return () => {
			if (hideTimer.current) clearTimeout(hideTimer.current);
		};
	}, []);

	const showSpoiler = spoiler && !spoilerRevealed;

	const videoId = `${React.useId()}-${src}`;

	React.useEffect(() => {
		return () => {
			if (useMediaStore.getState().activeVideoId === videoId) {
				useMediaStore.getState().setActiveVideoId(null);
			}
		};
	}, [videoId]);

	React.useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		v.muted = isMuted;
		v.volume = volume;
	}, [isMuted, volume]);

	React.useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		if (v.readyState >= 1 && Number.isFinite(v.duration) && v.duration > 0) {
			setDuration(v.duration);
		}
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: src is a trigger dep, not used inside
	React.useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		v.playbackRate = 1;
		setSpeed(1);
		setCurrentTime(0);
	}, [src]);

	React.useEffect(() => {
		const handler = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener("fullscreenchange", handler);
		return () => document.removeEventListener("fullscreenchange", handler);
	}, []);

	const safePlay = React.useCallback(() => {
		const v = videoRef.current;
		if (!v || autoplayFailed.current) return;

		const { isMuted: muted, volume: vol } = useMediaStore.getState();
		v.muted = muted;
		v.volume = vol;

		v.play().catch((_err) => {
			autoplayFailed.current = true;
			// Release the slot so other videos aren't permanently blocked
			if (useMediaStore.getState().activeVideoId === videoId) {
				useMediaStore.getState().setActiveVideoId(null);
			}
		});
	}, [videoId]);

	// Engine 1: IntersectionObserver
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
					userPaused.current = false;
					autoplayFailed.current = false;

					if (useMediaStore.getState().activeVideoId === videoId) {
						setActiveVideoId(null);
					}
					if (!v.paused) v.pause();
				}
			},
			{
				root: scrollRoot,
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

	// Engine 2: Store subscription
	// Imperative reaction to activeVideoId changes.
	// Does NOT use React state because by the time a re-render fires, the
	// currently-playing video would have already played for several frames.
	React.useEffect(() => {
		return useMediaStore.subscribe((state) => {
			const v = videoRef.current;
			if (!v) return;

			if (state.activeVideoId === videoId) {
				if (!userPaused.current && v.paused) {
					safePlay();
				}
			} else if (
				state.activeVideoId === null &&
				inViewRef.current &&
				autoPlay &&
				spoilerRevealed &&
				!userPaused.current &&
				!autoplayFailed.current &&
				!useMediaStore.getState().isPausedGlobally
			) {
				if (!useMediaStore.getState().activeVideoId) {
					setActiveVideoId(videoId);
					safePlay();
				}
			} else if (!v.paused) {
				v.pause();
			}
		});
	}, [videoId, autoPlay, spoilerRevealed, setActiveVideoId, safePlay]);

	const togglePlay = () => {
		const v = videoRef.current;
		if (!v) return;

		if (v.paused) {
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
		if (val === 0) setMuted(true);
		else if (isMuted) setMuted(false);
	};

	const handleToggleMute = () => {
		if (isMuted) {
			if (volume === 0) setVolume(0.5);
			setMuted(false);
		} else {
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
	};

	const handleMenuToggle = () => {
		setMenuOpen((o) => !o);
		if (menuOpen) setMenuView("root");
	};

	const showControls = hovering || !playing || menuOpen || controlsVisible;

	const wrapperStyle: React.CSSProperties = aspectRatio
		? { aspectRatio: aspectRatio }
		: {};

	return (
		<section
			ref={containerRef}
			className={cn(
				"relative w-full bg-black rounded-lg overflow-hidden select-none border-accent border",
				className
			)}
			style={wrapperStyle}
			aria-label="Video player"
			tabIndex={0}
			onClick={
				showSpoiler
					? undefined
					: () => {
							if (!controlsVisible && !hovering) {
								flashControls();
							} else {
								flashControls();
								togglePlay();
							}
						}
			}
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
			onPointerEnter={(e) => {
				if (e.pointerType === "touch") return;
				setHovering(true);
			}}
			onPointerLeave={(e) => {
				if (e.pointerType === "touch") return;
				setHovering(false);
				setMenuOpen(false);
				setMenuView("root");
			}}
		>
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

			{!showSpoiler && (
				<div
					className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 pointer-events-none ${
						showControls ? "opacity-100" : "opacity-0"
					}`}
				>
					<div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />

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
