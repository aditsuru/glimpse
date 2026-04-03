import { useEffect, useState } from "react";

export function useCooldown(storageKey: string, cooldownMs: number) {
	const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

	useEffect(() => {
		const stored = localStorage.getItem(storageKey);
		if (!stored) {
			setSecondsLeft(0);
			return;
		}

		const remaining = Math.ceil((parseInt(stored, 10) - Date.now()) / 1000);
		if (remaining <= 0) {
			localStorage.removeItem(storageKey);
			setSecondsLeft(0);
			return;
		}
		setSecondsLeft(remaining);
	}, [storageKey]);

	useEffect(() => {
		if (!secondsLeft || secondsLeft <= 0) return;
		const timeout = setTimeout(
			() => setSecondsLeft((s) => (s as number) - 1),
			1000
		);
		return () => clearTimeout(timeout);
	}, [secondsLeft]);

	const startCooldown = () => {
		localStorage.setItem(storageKey, (Date.now() + cooldownMs).toString());
		setSecondsLeft(cooldownMs / 1000);
	};

	return { secondsLeft, startCooldown };
}
