import { AnimatePresence, motion } from "motion/react";
import { FieldError } from "../ui/field";

const AnimatedFieldError = ({
	invalid,
	errors,
}: {
	invalid: boolean;
	errors?: { message?: string } | undefined;
}) => {
	return (
		<AnimatePresence mode="wait">
			{invalid && (
				<motion.div
					initial={{ opacity: 0, height: 0, y: -5 }}
					animate={{ opacity: 1, height: "auto", y: 0 }}
					exit={{ opacity: 0, height: 0, y: -5 }}
					transition={{
						duration: 0.3,
						ease: "easeOut",
					}}
				>
					<div>
						<FieldError errors={[errors]} />
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default AnimatedFieldError;
