## Utility: S3 File Upload

What: Presigned URL based file uploads. Frontend uploads directly to storage, backend only moves temp → permanent and stores the key.

### Flow

1. Frontend requests a presigned URL from backend (temp/ prefix)
2. Frontend uploads directly to storage using that URL
3. Frontend submits form/request with the temp key
4. Backend first create db entry by generating permanent key from temp key
5. Backend moves file from temp to permanent url
6. Each read call must constructs public URL from key at read time

### Functions

- getPresignedUploadUrl({ key, contentType }) → { presignedUrl, key }
- getPermanentKey({ tempKey }) → { permanentKey }
- moveFile({ fromKey, toKey }) → { success: true }
- deleteFile({ key }) → { success: true }
- constructPublicUrl({ key }) → { publicUrl }

### Key Convention

- Temp - temp/{type}/{userId}
- Permanent - {type}/{userId}

Overwrite on update — same key, no versioning.

### Storage per Environment

| Env          | Driver        | Endpoint                            |
| ------------ | ------------- | ----------------------------------- |
| Local        | MinIO         | S3_ENDPOINT (http://localhost:9000) |
| Staging/Prod | Cloudflare R2 | derived from CLOUDFLARE_ACCOUNT_ID  |

### Lifecycle Rules

Set on bucket: delete anything under `temp/` older than 24 hours.
Handles abandoned uploads — frontend got presigned URL but never completed the flow.

### Design Decisions

- DB write before file move → broken image is visible to user, deletable and retryable
- Stale permanent file (move fails after DB write) accepted as least-likely tradeoff
- Frontend uploads directly → backend never handles file bytes
- Key stored in DB not URL → constructPublicUrl() is the single source of truth

### Env Vars

- S3_ENDPOINT — MinIO only, absent on prod
- CLOUDFLARE_ACCOUNT_ID — R2 only, absent locally
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_BUCKET_NAME
- R2_PUBLIC_URL
