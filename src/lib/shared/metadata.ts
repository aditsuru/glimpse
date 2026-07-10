import type { Metadata } from "next";

export function buildMetadata({
	title,
	description,
	noindex = false,
}: {
	title: string;
	description?: string;
	noindex?: boolean;
}): Metadata {
	return {
		title,
		...(description && { description }),
		...(noindex && {
			robots: { index: false, follow: false },
		}),
	};
}

export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
