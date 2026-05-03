import { Ghost } from "lucide-react";

interface EmptyStateMessage {
	title: string;
	description?: string;
}

const EmptyStateMessage = ({ title, description }: EmptyStateMessage) => {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
			<Ghost className="size-12" />
			<p className="text-lg font-semibold text-foreground">{title}</p>
			{description && <p className="text-sm">{description}</p>}
		</div>
	);
};
export default EmptyStateMessage;
