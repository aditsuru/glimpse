export const ALLOWED_MIME_TYPES = {
	avatar: ["image/jpeg", "image/png", "image/webp", "image/gif"],
	banner: ["image/jpeg", "image/png", "image/webp", "image/gif"],
	attachment: [
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/gif",
		"video/mp4",
		"video/webm",
	],
} as const;

export const ALLOWED_FILE_TYPES = ["avatar", "banner", "attachment"];

export const VIDEO_MIME_TYPES: string[] = ["video/mp4", "video/webm"];
export const GIF_MIME_TYPE = "image/gif";

export const isVideo = (mimeType: string) =>
	VIDEO_MIME_TYPES.includes(mimeType);
export const isImage = (mimeType: string) => !isVideo(mimeType);
export const isGif = (mimeType: string) => mimeType === GIF_MIME_TYPE;

export const RESERVED_USERNAMES = new Set([
	"admin",
	"administrator",
	"root",
	"support",
	"help",
	"system",
	"api",
	"dev",
	"www",
	"webmaster",
	"status",
	"about",
	"settings",
]);

export const LOCAL_STORAGE_KEYS = {
	VERIFY_EMAIL_COOLDOWN: "verify_email_cooldown",
	FORGOT_PASSWORD_COOLDOWN: "forgot_password_cooldown",
	GLIMPSE_MEDIA_STORAGE: "glimpse_media_storage",
};
