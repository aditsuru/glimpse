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

export const FOLLOW_REQUEST_STATUS = ["accepted", "pending"] as const;
export type FollowRequestStatusType = (typeof FOLLOW_REQUEST_STATUS)[number];

export const PROFILE_TYPES = ["private", "public"] as const;
export type ProfileType = (typeof PROFILE_TYPES)[number];

export const NOTIFICATION_TYPES = [
	"like_post",
	"like_comment",
	"comment",
	"reply",
	"follow",
	"follow_request",
	"mention",
	"system",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

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
