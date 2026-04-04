import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function initials(name: string) {
	return (
		name
			?.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase() ?? "?"
	);
}

export function timeAgo(date: Date) {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
	if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d`;
	if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo`;
	return `${Math.floor(seconds / 31536000)}y`;
}
