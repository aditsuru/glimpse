import { cn } from "@/lib/client/utils";

interface LoaderProps {
	className?: string;
}

export const Loader = ({ className }: LoaderProps) => {
	return (
		<div
			className={cn(
				"border-muted-foreground border-3 border-b-primary animate-spin inline-block w-[22px] h-[22px] rounded-full",
				className
			)}
		></div>
	);
};
