import { differenceInSeconds, format } from "date-fns";

export function formatPostDate(date: Date | string): string {
	const seconds = differenceInSeconds(new Date(), new Date(date));
	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
	if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
	return format(new Date(date), "MMM d");
}

export const formatNumber = new Intl.NumberFormat("en", {
	notation: "compact",
});
