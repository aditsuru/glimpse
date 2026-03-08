"use client";

import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function InteractiveSidebarPfp() {
	return (
		<motion.div
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			transition={{
				type: "spring",
				stiffness: 400,
				damping: 10,

				mass: 0.5,
			}}
			style={{ originX: 0.5, originY: 0.5 }}
		>
			<Avatar className="w-48 h-48">
				<AvatarImage src="https://github.com/aditsuru.png" alt="@shadcn" />
				<AvatarFallback>
					<HugeiconsIcon icon={UserIcon} size={48} />
				</AvatarFallback>
			</Avatar>
		</motion.div>
	);
}

export default InteractiveSidebarPfp;
