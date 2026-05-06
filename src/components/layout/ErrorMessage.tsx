import { Meh } from "lucide-react";

const ErrorMessage = () => {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
			<Meh className="size-12" />
			<div className="text-center">
				<p className="text-lg font-semibold text-foreground text-center">
					Something went wrong
				</p>
				<p className="text-sm text-center">Please refresh and try again.</p>
			</div>
		</div>
	);
};

export default ErrorMessage;
