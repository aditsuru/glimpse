import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface BillboardProps {
	/** The billboard frame image src (acts as an overlay on top of content) */
	frameSrc: string;
	/** Any content — <img>, <video>, or whatever you want displayed inside the frame */
	children: React.ReactNode;
}

// Original frame dimensions
const FRAME_W = 1474;
const FRAME_H = 1080;

// Content insets (in original px)
const INSET_TOP = 207;
const INSET_BOTTOM = 48;
const INSET_SIDE = 45;

// Derived content dimensions
const CONTENT_W = FRAME_W - INSET_SIDE * 2; // 1384
const CONTENT_H = FRAME_H - INSET_TOP - INSET_BOTTOM; // 825

export const Billboard = ({ frameSrc, children }: BillboardProps) => {
	return (
		<div className="relative w-full">
			{/* Outer shell — locked to the billboard frame ratio */}
			<AspectRatio ratio={FRAME_W / FRAME_H}>
				{/* ── Content slot ─────────────────────────────────────────
            Positioned absolutely using percentage offsets so it
            scales perfectly at any rendered size.                  */}
				<div
					className="absolute"
					style={{
						top: `${(INSET_TOP / FRAME_H) * 100}%`, // ~19.17 %
						bottom: `${(INSET_BOTTOM / FRAME_H) * 100}%`, // ~4.44 %
						left: `${(INSET_SIDE / FRAME_W) * 100}%`, // ~3.05 %
						right: `${(INSET_SIDE / FRAME_W) * 100}%`, // ~3.05 %
						zIndex: 0,
					}}
				>
					{/* Inner AspectRatio keeps whatever you drop in here
              (image, video, div…) at the correct 1384 × 825 ratio */}
					<AspectRatio ratio={CONTENT_W / CONTENT_H} className="h-full w-full">
						{children}
					</AspectRatio>
				</div>

				{/* ── Billboard frame overlay ───────────────────────────────
            Rendered ABOVE the content so the frame edges & shadows
            naturally mask/blend with whatever is inside.           */}
				<Image
					src={frameSrc}
					alt="Billboard frame"
					fill
					priority
					className="pointer-events-none select-none brightness-75"
					style={{
						objectFit: "fill", // stretch to fill — frame was designed for this exact ratio
						zIndex: 10,
					}}
				/>
			</AspectRatio>
		</div>
	);
};
