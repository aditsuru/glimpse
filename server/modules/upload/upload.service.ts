import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ORPCError } from "@orpc/server";
import { nanoid } from "nanoid";
import type * as z from "zod";
import { ALLOWED_FILES_TYPES } from "@/lib/constants";
import { StoragePrefix, s3 } from "@/lib/s3";
import type { uploadSchema } from "./upload.schema";

export class UploadService {
	async getPresignedUrl({
		fileType,
	}: z.infer<typeof uploadSchema.getPresignedUrl.input>): Promise<
		z.infer<typeof uploadSchema.getPresignedUrl.output>
	> {
		// FileType check
		if (!(ALLOWED_FILES_TYPES as readonly string[]).includes(fileType)) {
			throw new ORPCError("BAD_REQUEST", {
				message: "File type not allowed",
			});
		}

		// Main logic
		const fileKey = `${StoragePrefix.UPLOADS}/${nanoid(10)}`;
		const bucket = process.env.R2_BUCKET_NAME as string; // TODO: Update to use config module when credentials are available

		const command = new PutObjectCommand({
			Bucket: bucket,
			Key: fileKey,
			ContentType: fileType,
		});

		const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
		const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`; // TODO: Update to use config module when credentials are available

		return { presignedUrl, fileUrl, fileKey };
	}
}
