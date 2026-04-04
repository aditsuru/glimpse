import { asc, inArray } from "drizzle-orm";
import type { db as DBType } from "@/drizzle/db";
import { attachmentsTable } from "@/drizzle/schema";
import type { ATTACHMENT_TYPES } from "@/lib/constants";

export async function fetchAttachmentsMap(
	db: typeof DBType,
	posts: { id: string; hasAttachments: boolean }[]
): Promise<
	Map<
		string,
		{ fileUrl: string; fileType: (typeof ATTACHMENT_TYPES)[number] }[]
	>
> {
	const map = new Map();
	const postsWithAttachments = posts.filter((p) => p.hasAttachments);
	if (postsWithAttachments.length === 0) return map;

	const allAttachments = await db
		.select({
			postId: attachmentsTable.postId,
			fileUrl: attachmentsTable.fileUrl,
			fileType: attachmentsTable.fileType,
		})
		.from(attachmentsTable)
		.where(
			inArray(
				attachmentsTable.postId,
				postsWithAttachments.map((p) => p.id)
			)
		)
		.orderBy(asc(attachmentsTable.createdAt));

	for (const attachment of allAttachments) {
		if (!map.has(attachment.postId)) map.set(attachment.postId, []);
		map
			.get(attachment.postId)
			.push({ fileUrl: attachment.fileUrl, fileType: attachment.fileType });
	}
	return map;
}
