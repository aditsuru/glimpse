export const ALLOWED_FILES_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"video/mp4",
	"video/webm",
] as const;

export const ATTACHMENT_TYPES = ["image", "gif", "video"] as const;

export const REDIS_KEYS = {
	POST_SEEN: (userId: string) => `post:seen:${userId}`,
	VIEWS_COUNT: (postId: string) => `post:views:${postId}`,
	SYNC_PENDING_VIEWS_LIST: () => `sync:pending:views`,
};

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
