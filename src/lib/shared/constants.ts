export const ALLOWED_MIME_TYPES = {
	avatar: ["image/jpeg", "image/png", "image/webp"],
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

export const MAX_FILE_SIZES = {
	image: 5 * 1024 * 1024, // 5MB
	video: 10 * 1024 * 1024, // 10MB
} as const;

export const VIDEO_MIME_TYPES: string[] = ["video/mp4", "video/webm"];
export const GIF_MIME_TYPE = "image/gif";

export const isVideo = (mimeType: string) =>
	VIDEO_MIME_TYPES.includes(mimeType);
export const isImage = (mimeType: string) => !isVideo(mimeType);
export const isGif = (mimeType: string) => mimeType === GIF_MIME_TYPE;
export const isAllowedAvatarType = (mimeType: string) =>
	(ALLOWED_MIME_TYPES.avatar as readonly string[]).includes(mimeType);

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

export const DEFAULT_PFP_URL = "/static/default-pfp.png";

export const LOCAL_STORAGE_KEYS = {
	VERIFY_EMAIL_COOLDOWN: "verify_email_cooldown",
	FORGOT_PASSWORD_COOLDOWN: "forgot_password_cooldown",
	GLIMPSE_MEDIA_STORAGE: "glimpse_media_storage",
};

const SIDEBAR_GIF_BASE = "https://ik.imagekit.io/aditsuru/Glimpse";
const SIDEBAR_GIF_COUNT = 8;

export const SIDEBAR_GIFS = Array.from(
	{ length: SIDEBAR_GIF_COUNT },
	(_, i) => `${SIDEBAR_GIF_BASE}/${i + 1}.gif`
);
