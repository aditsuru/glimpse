import { config } from "./config";

export function constructPublicUrl({
	key,
	updatedAt,
}: {
	key: string;
	updatedAt?: Date;
}) {
	const url = `${config.R2_PUBLIC_URL}/${key}`;
	return { publicUrl: updatedAt ? `${url}?t=${updatedAt.getTime()}` : url };
}
