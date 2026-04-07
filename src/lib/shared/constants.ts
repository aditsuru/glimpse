export const ALLOWED_FILES_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"video/mp4",
	"video/webm",
] as const;

export const ATTACHMENT_TYPES = ["image", "gif", "video"] as const;
export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

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
	GLIMPSE_MEDIA_STORAGE: "glimpse-media-storage",
};
