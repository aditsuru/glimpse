import type { FollowStatusEnumType } from "@/db/schema";

export type ViewerFollowStatus =
	| "none"
	| "pending"
	| "accepted"
	| "follows_you"
	| "follows_you_pending"
	| "mutual";

export const viewerFollowStatusEnum = [
	"none",
	"pending",
	"accepted",
	"follows_you",
	"follows_you_pending",
	"mutual",
] as const;

export function computeViewerStatus(
	iFollow: FollowStatusEnumType | undefined,
	theyFollow: FollowStatusEnumType | undefined
): ViewerFollowStatus {
	if (iFollow === "accepted" && theyFollow === "accepted") return "mutual";
	if (iFollow === "accepted") return "accepted";
	if (iFollow === "pending") return "pending";
	if (theyFollow === "accepted") return "follows_you";
	if (theyFollow === "pending") return "follows_you_pending";
	return "none";
}
