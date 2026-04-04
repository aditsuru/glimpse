"use client";

import * as React from "react";
import {
	Download,
	Gauge,
	Maximize,
	MonitorPlay,
	Pause,
	Play,
	Settings,
	Volume2,
	VolumeX,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

const SPEEDS = [0.5, 1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

interface VideoPlayerProps {
	src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const containerRef = React.useRef<HTMLDivElement>(null);

	const [playing, setPlaying] = React.useState(false);
	const [muted, setMuted] = React.useState(true);
	const [progress, setProgress] = React.useState(0);
	const [duration, setDuration] = React.useState(0);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [hovering, setHovering] = React.useState(false);
	const [speed, setSpeed] = React.useState<Speed>(1);
	const [settingsOpen, setSettingsOpen] = React.useState(false);

	// Catch metadata if the video loads from browser cache before events attach
	React.useEffect(() => {
		const v = videoRef.current;
		if (v && v.readyState >= 1) {
			setDuration(v.duration);
		}
	}, []);

	const togglePlay = () => {
		const v = videoRef.current;
		if (!v) return;
		if (v.paused) {
			v.play();
			setPlaying(true);
		} else {
			v.pause();
			setPlaying(false);
		}
	};

	const toggleMute = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.stopPropagation();
		const v = videoRef.current;
		if (!v) return;
		v.muted = !v.muted;
		setMuted(v.muted);
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

	const handleLoadedMetadata = () => {
		const v = videoRef.current;
		if (!v) return;
		setDuration(v.duration);
	};

	const handleSpeedChange = (s: Speed) => {
		const v = videoRef.current;
		if (!v) return;
		v.playbackRate = s;
		setSpeed(s);
	};

	const toggleFullscreen = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.stopPropagation();
		const el = containerRef.current;
		if (!el) return;
		if (!document.fullscreenElement) {
			el.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	const formatTime = (s: number) => {
		if (Number.isNaN(s)) return "0:00";
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, "0")}`;
	};

	const showControls = hovering || !playing || settingsOpen;

	return (
		// biome-ignore lint/a11y/useSemanticElements: Custom video players require non-semantic wrappers for controls
		<div
			ref={containerRef}
			role="region"
			aria-label="Video Player"
			// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard navigation requires a focusable region
			tabIndex={0}
			className="relative h-full w-full overflow-hidden rounded-lg bg-black cursor-pointer group"
			onClick={togglePlay}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					togglePlay();
				}
			}}
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
		>
			<video
				ref={videoRef}
				src={src}
				loop
				muted
				playsInline
				preload="metadata"
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
				onEnded={() => setPlaying(false)}
				className="h-full w-full object-cover"
			/>

			{/* Controls Overlay */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: Overlay must capture clicks to prevent underlying video interactions */}
			<div
				className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-4 pb-1 pt-12 transition-opacity duration-300 ${
					showControls ? "opacity-100" : "opacity-0"
				}`}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<Slider
					value={[progress]}
					max={duration || 1}
					step={0.05}
					onValueChange={handleSeek}
					className="mb-1 cursor-grab active:cursor-grabbing **:data-[slot=slider-thumb]:h-3.5 **:data-[slot=slider-thumb]:w-3.5 **:data-[slot=slider-thumb]:border-0 **:data-[slot=slider-thumb]:bg-white **:data-[slot=slider-range]:bg-white **:data-[slot=slider-track]:bg-white/30"
				/>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={togglePlay}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") togglePlay();
							}}
							className="text-white hover:bg-white/20 hover:text-white rounded-full h-8 w-8"
						>
							{playing ? <Pause size={18} /> : <Play size={18} />}
						</Button>
						<span className="tabular-nums text-sm font-medium text-white/90 ml-2">
							{formatTime(currentTime)} / {formatTime(duration)}
						</span>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleMute}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") toggleMute(e);
							}}
							className="text-white hover:bg-white/20 hover:text-white rounded-full h-8 w-8"
						>
							{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
						</Button>

						<DropdownMenu onOpenChange={setSettingsOpen}>
							<DropdownMenuTrigger
								className={buttonVariants({
									variant: "ghost",
									size: "icon",
									className:
										"text-white hover:bg-white/20 hover:text-white rounded-full h-8 w-8 border-0 outline-none ring-0 focus-visible:ring-0",
								})}
							>
								<Settings size={18} />
							</DropdownMenuTrigger>
							<DropdownMenuContent side="top" align="end" className="w-56">
								<DropdownMenuSub>
									<DropdownMenuSubTrigger className="flex items-center gap-3">
										<Gauge size={16} />
										<span className="flex-1">Playback speed</span>
										<span className="text-xs text-muted-foreground">
											{speed === 1 ? "1x" : `${speed}x`}
										</span>
									</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											{SPEEDS.map((s) => (
												<DropdownMenuItem
													key={s}
													onClick={() => handleSpeedChange(s)}
													className="justify-between"
												>
													{s === 1 ? "Normal" : `${s}x`}
													{s === speed && (
														<span className="h-1.5 w-1.5 rounded-full bg-foreground" />
													)}
												</DropdownMenuItem>
											))}
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>

								<DropdownMenuSeparator />

								<DropdownMenuItem disabled className="flex items-center gap-3">
									<MonitorPlay size={16} />
									<span className="flex-1">Video quality</span>
									<span className="text-xs text-muted-foreground">Auto</span>
								</DropdownMenuItem>

								<DropdownMenuSeparator />

								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										const a = document.createElement("a");
										a.href = src;
										a.download = "video.mp4";
										a.target = "_blank";
										a.rel = "noreferrer noopener";
										document.body.appendChild(a);
										a.click();
										document.body.removeChild(a);
									}}
									className="flex items-center gap-3 cursor-pointer"
								>
									<Download size={16} />
									Download video
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<Button
							variant="ghost"
							size="icon"
							onClick={toggleFullscreen}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") toggleFullscreen(e);
							}}
							className="text-white hover:bg-white/20 hover:text-white rounded-full h-8 w-8"
						>
							<Maximize size={18} />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
