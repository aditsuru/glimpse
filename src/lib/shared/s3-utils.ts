export function constructPublicUrl({ key }: { key: string }) {
	const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
	return { publicUrl };
}
