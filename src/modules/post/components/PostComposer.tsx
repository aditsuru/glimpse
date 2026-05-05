"use client";

import { Eye, EyeOff, ImageIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type CarouselImage, ImageCarousel } from "@/components/ImageCarousel";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "@/components/VideoPlayer";
import { authClient } from "@/lib/client/auth-client";
import { uploadToS3 } from "@/lib/client/upload-utils";
import { cn } from "@/lib/client/utils";
import {
	ALLOWED_MIME_TYPES,
	DEFAULT_PFP_URL,
	isGif,
	isImage,
	isVideo,
	MAX_FILE_SIZES,
	MAX_POST_BODY_LENGTH,
} from "@/lib/shared/constants";
import { useProfile } from "@/modules/profile/profile.queries";
import { useCreate, useGetAttachmentPresignedUrl } from "../post.queries";

// ─── Types ───────────────────────────────────────────────────────────────────

type AttachmentItem = {
	tempKey: string;
	preview: string; // object URL
	mimeType: string;
};

// ─── Ring Counter ─────────────────────────────────────────────────────────────

const RING_RADIUS = 10;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const WARN_THRESHOLD = 0.8; // 80% = 160 chars

function CharRing({ count, max }: { count: number; max: number }) {
	const progress = count / max;
	const dashoffset = RING_CIRCUMFERENCE * (1 - progress);
	const isWarn = progress >= WARN_THRESHOLD;
	const isOver = progress >= 1;
	const remaining = max - count;

	return (
		<div
			className={cn(
				"flex items-center gap-1.5 transition-opacity duration-200",
				count === 0 ? "opacity-0" : "opacity-100"
			)}
		>
			{isWarn && (
				<span
					className={cn(
						"text-xs tabular-nums font-medium",
						isOver ? "text-destructive" : "text-yellow-500"
					)}
				>
					{remaining}
				</span>
			)}
			<svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
				{/* track */}
				<circle
					cx={12}
					cy={12}
					r={RING_RADIUS}
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					className="text-muted/30"
				/>
				{/* fill */}
				<circle
					cx={12}
					cy={12}
					r={RING_RADIUS}
					fill="none"
					strokeWidth={2}
					strokeDasharray={RING_CIRCUMFERENCE}
					strokeDashoffset={dashoffset}
					strokeLinecap="round"
					className={cn(
						"transition-all duration-150 -rotate-90 origin-center",
						isOver
							? "stroke-destructive"
							: isWarn
								? "stroke-yellow-500"
								: "stroke-primary"
					)}
				/>
			</svg>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PostComposer = ({ onSuccess }: { onSuccess?: () => void }) => {
	const { data: session } = authClient.useSession();
	const { data: profile } = useProfile({ userId: session?.user.id ?? "" });
	const createPost = useCreate({ viewerUserId: session?.user.id ?? "" });
	const getAttachmentPresignedUrl = useGetAttachmentPresignedUrl();

	const router = useRouter();

	const fileInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [body, setBody] = useState("");
	const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
	const [spoiler, setSpoiler] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const dragCounterRef = useRef(0); // tracks nested drag enter/leave

	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	// ── Derived state ──────────────────────────────────────────────────────────

	const attachmentType =
		attachments.length > 0
			? isVideo(attachments[0].mimeType)
				? "video"
				: "image"
			: null;

	const isDisabled = isSubmitting || isUploading;
	const isEmpty = !body.trim() && attachments.length === 0;
	const isBodyOver = body.length > MAX_POST_BODY_LENGTH;
	const canSubmit = !isEmpty && !isDisabled && !isBodyOver;

	// ── Auto-grow textarea ─────────────────────────────────────────────────────

	const growTextarea = useCallback(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}, []);

	// ── Upload helper ──────────────────────────────────────────────────────────

	const uploadFile = useCallback(
		async (file: File): Promise<AttachmentItem | null> => {
			if (
				!(ALLOWED_MIME_TYPES.attachment as readonly string[]).includes(
					file.type
				)
			) {
				toast.error("File type not allowed");
				return null;
			}

			const preview = URL.createObjectURL(file);
			try {
				const { presignedUrl, key } =
					await getAttachmentPresignedUrl.mutateAsync({
						mimeType:
							file.type as (typeof ALLOWED_MIME_TYPES.attachment)[number],
					});
				await uploadToS3(presignedUrl, file);
				return { tempKey: key, preview, mimeType: file.type };
			} catch {
				URL.revokeObjectURL(preview);
				toast.error("Upload failed, please try again");
				return null;
			}
		},
		[getAttachmentPresignedUrl]
	);

	// ── File validation ────────────────────────────────────────────────────────

	const validateAndUpload = useCallback(
		async (files: FileList | File[]) => {
			const fileArray = Array.from(files);
			if (fileArray.length === 0) return;

			const firstFile = fileArray[0];

			// Video rules
			if (isVideo(firstFile.type)) {
				if (attachmentType === "image") {
					toast.error("Cannot mix video and images");
					return;
				}
				if (attachments.length > 0 || fileArray.length > 1) {
					toast.error("Only one video allowed");
					return;
				}
			}

			// Image rules
			if (isImage(firstFile.type)) {
				if (attachmentType === "video") {
					toast.error("Cannot mix images and video");
					return;
				}
				const anyVideo = fileArray.some((f) => isVideo(f.type));
				if (anyVideo) {
					toast.error("Cannot mix images and video");
					return;
				}
			}

			for (const file of fileArray) {
				const limit = isVideo(file.type)
					? MAX_FILE_SIZES.video
					: MAX_FILE_SIZES.image;
				if (file.size > limit) {
					toast.error(
						`${isVideo(file.type) ? "Video" : "Image"} must be under ${limit / (1024 * 1024)}MB`
					);
					return;
				}
			}

			const optimistic: AttachmentItem[] = fileArray.map((f) => ({
				tempKey: "", // placeholder
				preview: URL.createObjectURL(f),
				mimeType: f.type,
			}));
			setAttachments((prev) => [...prev, ...optimistic]);
			setIsUploading(true);

			try {
				const results = await Promise.all(fileArray.map(uploadFile));
				// Replace optimistic entries with real keys
				setAttachments((prev) => {
					const updated = [...prev];
					const startIdx = prev.length - optimistic.length;
					results.forEach((result, i) => {
						if (result) updated[startIdx + i] = result;
					});
					return updated;
				});
			} finally {
				setIsUploading(false);
			}
		},
		[attachments, attachmentType, uploadFile]
	);

	// ── File input change ──────────────────────────────────────────────────────

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation();
		const files = Array.from(e.target.files ?? []);
		e.target.value = "";
		if (!files || files.length === 0) return;
		await validateAndUpload(files);
	};

	// ── Drag and drop ──────────────────────────────────────────────────────────

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		dragCounterRef.current++;
		const hasFiles = Array.from(e.dataTransfer.items).some(
			(item) =>
				item.kind === "file" &&
				(item.type.startsWith("image/") || item.type.startsWith("video/"))
		);
		if (hasFiles) setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		dragCounterRef.current--;
		if (dragCounterRef.current === 0) setIsDragging(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
	}, []);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			dragCounterRef.current = 0;
			setIsDragging(false);
			const files = e.dataTransfer.files;
			if (files.length > 0) await validateAndUpload(files);
		},
		[validateAndUpload]
	);

	// ── Attachment actions ─────────────────────────────────────────────────────

	const removeAttachment = (index: number) => {
		setAttachments((prev) => {
			URL.revokeObjectURL(prev[index].preview);
			return prev.filter((_, i) => i !== index);
		});
	};

	// ── Submit ─────────────────────────────────────────────────────────────────

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		if (!canSubmit) return;

		const trimmedBody = body.trim();
		if (!trimmedBody && attachments.length === 0) return;

		setError(null);
		setIsSubmitting(true);

		try {
			const { postId } = await createPost.mutateAsync({
				body: trimmedBody || undefined,
				spoiler,
				attachments:
					attachments.length > 0
						? attachments.map((a) => ({
								attachmentKey: a.tempKey,
								mimeType:
									a.mimeType as (typeof ALLOWED_MIME_TYPES.attachment)[number],
							}))
						: undefined,
			});

			// cleanup
			setBody("");
			attachments.forEach((a) => {
				URL.revokeObjectURL(a.preview);
			});
			setAttachments([]);
			setSpoiler(false);
			onSuccess?.();
			router.push(`/p/${postId}`);
		} catch {
			setError("Failed to post. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// ── Carousel images ────────────────────────────────────────────────────────

	const carouselImages: CarouselImage[] = attachments
		.filter((a) => isImage(a.mimeType))
		.map((a, i) => ({
			src: a.preview,
			alt: `Attachment ${i + 1}`,
			unoptimized: isGif(a.mimeType),
		}));

	const videoAttachment = attachments.find((a) => isVideo(a.mimeType));

	// ── Render ─────────────────────────────────────────────────────────────────

	return (
		<div
			className={cn(
				"relative w-full flex flex-col gap-3",
				isDisabled && "opacity-60 pointer-events-none"
			)}
		>
			<form
				onSubmit={handleSubmit}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				{/* Drag overlay — only for images */}
				{isDragging && (
					<div className="absolute inset-0 z-10 rounded-xl border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm flex items-center justify-center pointer-events-none">
						<div className="flex flex-col items-center gap-2 text-primary">
							<ImageIcon className="size-8" />
							<span className="text-sm font-medium">Drop images here</span>
						</div>
					</div>
				)}

				{/* Body */}
				<div className="relative flex gap-2">
					<label htmlFor="post-body" className="sr-only">
						Post content
					</label>

					<Avatar className="mt-2" size="lg">
						<AvatarImage src={profile?.avatarUrl || DEFAULT_PFP_URL} />
					</Avatar>

					<Textarea
						ref={textareaRef}
						id="post-body"
						placeholder="What's happening?"
						className={cn(
							"resize-none min-h-[40px] max-h-60 overflow-y-auto py-3 text-xl!",
							"border-none shadow-none focus-visible:ring-0 bg-transparent! mb-4",
							isBodyOver && "text-destructive"
						)}
						value={body}
						onChange={(e) => {
							setBody(e.target.value);
							setError(null);
							growTextarea();
						}}
						disabled={isDisabled}
					/>
				</div>

				{/* Error */}
				{error && (
					<p className="text-sm text-destructive px-1 mb-2 font-medium">
						{error}
					</p>
				)}

				{/* Attachment preview */}
				{attachments.length > 0 && (
					<div className="relative rounded-xl overflow-hidden">
						{/* Video */}
						{videoAttachment && (
							<VideoPlayer
								src={videoAttachment.preview}
								spoiler={spoiler}
								className="w-full rounded-xl"
							/>
						)}

						{/* Images */}
						{carouselImages.length > 0 && (
							<ImageCarousel images={carouselImages} spoiler={spoiler} />
						)}
					</div>
				)}

				{/* Toolbar */}
				<div className="flex items-center justify-between pt-1 border-t border-border/40">
					<div className="flex items-center gap-1">
						{/* Add attachment */}
						<button
							type="button"
							disabled={isDisabled || attachmentType === "video"}
							onClick={(e) => {
								e.preventDefault();
								fileInputRef.current?.click();
							}}
							className={cn(
								"p-2 rounded-full text-muted-foreground transition-colors",
								(isDisabled || attachmentType === "video") &&
									"opacity-40 cursor-not-allowed",
								!(isDisabled || attachmentType === "video") &&
									"hover:bg-primary/10 hover:text-primary"
							)}
							title="Add image or video"
						>
							<ImageIcon className="size-5" />
						</button>

						{/* Spoiler toggle — only when attachments exist */}
						{attachments.length > 0 && (
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									setSpoiler((s) => !s);
								}}
								className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
								title={spoiler ? "Remove spoiler" : "Mark as spoiler"}
							>
								{spoiler ? (
									<EyeOff className="size-5" />
								) : (
									<Eye className="size-5" />
								)}
							</button>
						)}

						{/* Delete last attachment */}
						{attachments.length > 0 && (
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									removeAttachment(attachments.length - 1);
								}}
								className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
								title="Remove last attachment"
							>
								<Trash2 className="size-5" />
							</button>
						)}
					</div>

					<div className="flex items-center gap-3">
						<CharRing count={body.length} max={MAX_POST_BODY_LENGTH} />
						<Button
							type="submit"
							size="sm"
							disabled={!canSubmit}
							className="rounded-full px-5"
						>
							{isSubmitting ? "Posting…" : isUploading ? "Uploading…" : "Post"}
						</Button>
					</div>
				</div>
			</form>
			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept={
					attachmentType === "image"
						? ALLOWED_MIME_TYPES.attachment.filter((m) => !isVideo(m)).join(",")
						: ALLOWED_MIME_TYPES.attachment.join(",")
				}
				multiple={attachmentType !== "video"}
				className="hidden"
				onChange={handleFileChange}
			/>
		</div>
	);
};

export default PostComposer;
