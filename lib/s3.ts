import { S3Client } from "@aws-sdk/client-s3";

// TODO: later update to use config module when credentials are available

export const s3 = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
	},
});

export const StoragePrefix = {
	UPLOADS: "uploads",
	MEDIA: "media",
} as const;
