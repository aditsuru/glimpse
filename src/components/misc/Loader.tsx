import { cn } from "@/lib/client/utils";

interface LoaderProps {
	className?: string;
}

export const Loader = ({ className }: LoaderProps) => {
	return (
		<div
			className={cn(
				"border-muted border-3 border-b-primary animate-spin inline-block w-[24px] h-[24px] rounded-full",
				className
			)}
		></div>
	);
};
