import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface CooldownButtonProps {
	label: string;
	secondsLeft: number | null;
	isSubmitting?: boolean;
	onClick?: () => void;
	cooldownLabel?: (secondsLeft: number) => string;
	className?: string;
}

export function CooldownButton({
	label,
	secondsLeft,
	isSubmitting,
	onClick,
	cooldownLabel = (s) => `Wait ${s} to resend`,
	className,
}: CooldownButtonProps) {
	if (secondsLeft === null) {
		return (
			<Button className={className} disabled>
				{label}
			</Button>
		);
	}

	return (
		<Button
			type={onClick ? "button" : "submit"}
			className={className}
			onClick={onClick}
			disabled={secondsLeft > 0 || isSubmitting}
		>
			{isSubmitting ? (
				<Spinner className="mr-2" />
			) : secondsLeft <= 0 ? (
				label
			) : (
				cooldownLabel(secondsLeft)
			)}
		</Button>
	);
}
