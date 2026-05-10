"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useOnboardingTooltip() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const isOnboardingDone = searchParams.get("onboarding") === "complete";

	const [open, setOpen] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		if (isOnboardingDone && !dismissed) {
			setOpen(true);
		} else {
			setOpen(false);
		}
	}, [isOnboardingDone, dismissed]);

	const onHoverStart = () => {
		if (!isOnboardingDone) return;
		setOpen(false);
		setDismissed(true);

		const params = new URLSearchParams(searchParams.toString());
		params.delete("onboarding");
		router.replace(`?${params.toString()}`);
	};

	const onHoverEnd = () => {};

	return { open, onHoverStart, onHoverEnd, isOnboardingDone };
}
