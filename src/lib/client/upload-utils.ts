export async function uploadToS3(presignedUrl: string, file: File) {
	const res = await fetch(presignedUrl, {
		method: "PUT",
		body: file,
		headers: {
			"Content-Type": file.type,
		},
	});

	if (!res.ok) throw new Error("Upload failed");
}
