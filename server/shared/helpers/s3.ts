import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { StoragePrefix, s3 } from "@/lib/s3";

// TODO: Update to use config module when credentials are available
export function getPermanentKeyAndUrl(tempKey: string) {
	const permanentKey = tempKey.replace(
		StoragePrefix.UPLOADS,
		StoragePrefix.MEDIA
	);

	return {
		fileUrl: `${process.env.R2_PUBLIC_URL}/${permanentKey}`,
		permanentKey,
	};
}

export async function confirmUpload(tempKey: string) {
	const bucket = process.env.R2_BUCKET_NAME as string;
	const { fileUrl, permanentKey } = getPermanentKeyAndUrl(tempKey);

	await s3.send(
		new CopyObjectCommand({
			Bucket: bucket,
			CopySource: `${bucket}/${tempKey}`,
			Key: permanentKey,
		})
	);
	await s3.send(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: tempKey,
		})
	);

	return {
		fileUrl,
		fileKey: permanentKey,
	};
}

export async function deleteFile(key: string) {
	const bucket = process.env.R2_BUCKET_NAME as string;

	await s3.send(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: key,
		})
	);
}
