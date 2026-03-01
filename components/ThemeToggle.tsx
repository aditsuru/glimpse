"use client";

import { Moon01Icon, Sun02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return <div className="h-6 w-8" />;
	}

	return (
		<div className="">
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={theme}
					initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
					animate={{ rotate: 0, opacity: 1, scale: 1 }}
					whileHover={{ rotate: 180, scale: 1.2 }}
					exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
					transition={{
						type: "spring",
						stiffness: 300,
						damping: 20,
						duration: 1,
					}}
				>
					{theme === "dark" ? (
						<HugeiconsIcon
							icon={Moon01Icon}
							size={34}
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						/>
					) : (
						<HugeiconsIcon
							icon={Sun02Icon}
							size={34}
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						/>
					)}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
