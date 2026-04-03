import { Button } from "@/components/ui/button";
import { useCooldown } from "@/hooks/useCooldown";

interface CooldownButtonProps {
	storageKey: string;
	cooldownMs: number;
	onClick: (startCooldown: () => void) => Promise<void>;
	label: string;
	cooldownLabel?: (secondsLeft: number) => string;
	className?: string;
}

export function CooldownButton({
	storageKey,
	cooldownMs,
	onClick,
	label,
	cooldownLabel = (s) => `You can resend again in ${s}`,
	className,
}: CooldownButtonProps) {
	const { secondsLeft, startCooldown } = useCooldown(storageKey, cooldownMs);

	if (secondsLeft === null)
		return (
			<Button className={className} disabled>
				{label}
			</Button>
		);

	return (
		<Button
			className={className}
			onClick={() => onClick(startCooldown)}
			disabled={secondsLeft > 0}
		>
			{secondsLeft <= 0 ? label : cooldownLabel(secondsLeft)}
		</Button>
	);
}
