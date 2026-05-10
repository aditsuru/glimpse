import { Ghost } from "lucide-react";
import type React from "react";

interface EmptyStateMessageProps {
	title: string;
	description?: string;
	Icon?: React.ElementType;
}

const EmptyStateMessage = ({
	title,
	description,
	Icon,
}: EmptyStateMessageProps) => {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
			{Icon ? <Icon className="size-12" /> : <Ghost className="size-12" />}
			<p className="text-lg font-semibold text-foreground text-center">
				{title}
			</p>
			{description && <p className="text-sm text-center">{description}</p>}
		</div>
	);
};
export default EmptyStateMessage;
