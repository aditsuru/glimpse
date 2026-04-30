import "server-only";

import { S3Client } from "@aws-sdk/client-s3";
import { config } from "../shared/config";

export const s3 = new S3Client(
	config.S3_ENDPOINT
		? // Local — MinIO
			{
				endpoint: config.S3_ENDPOINT,
				region: "auto",
				credentials: {
					accessKeyId: config.R2_ACCESS_KEY_ID,
					secretAccessKey: config.R2_SECRET_ACCESS_KEY,
				},
				forcePathStyle: true, // required for MinIO
			}
		: // Staging/Prod — Cloudflare R2
			{
				endpoint: `https://${config.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
				region: "auto",
				credentials: {
					accessKeyId: config.R2_ACCESS_KEY_ID,
					secretAccessKey: config.R2_SECRET_ACCESS_KEY,
				},
			}
);
