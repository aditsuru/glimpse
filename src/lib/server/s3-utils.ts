import "server-only";

import {
	CopyObjectCommand,
	DeleteObjectCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../shared/config";
import { s3 } from "./s3";

export async function getPresignedUploadUrl({
	key,
	contentType,
}: {
	key: string;
	contentType: string;
}) {
	const url = await getSignedUrl(
		s3,
		new PutObjectCommand({
			Bucket: config.R2_BUCKET_NAME,
			Key: key,
			ContentType: contentType,
		}),
		{ expiresIn: 3600 }
	);

	return { presignedUrl: url, key };
}

export function getPermanentKey({ tempKey }: { tempKey: string }) {
	const permanentKey = tempKey.replace(/^temp\//, "");
	return { permanentKey };
}

export async function moveFile({
	fromKey,
	toKey,
}: {
	fromKey: string;
	toKey: string;
}) {
	await s3.send(
		new CopyObjectCommand({
			Bucket: config.R2_BUCKET_NAME,
			CopySource: `${config.R2_BUCKET_NAME}/${fromKey}`,
			Key: toKey,
		})
	);

	await s3.send(
		new DeleteObjectCommand({
			Bucket: config.R2_BUCKET_NAME,
			Key: fromKey,
		})
	);

	return { success: true };
}

export async function deleteFile({ key }: { key: string }) {
	await s3.send(
		new DeleteObjectCommand({
			Bucket: config.R2_BUCKET_NAME,
			Key: key,
		})
	);

	return { success: true };
}

export function constructPublicUrl({ key }: { key: string }) {
	const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
	return { publicUrl };
}
