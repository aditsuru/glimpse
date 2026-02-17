import { Loader } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";

interface FormButtonProps<T extends FieldValues>
	extends Omit<React.ComponentProps<typeof Button>, "form"> {
	form: UseFormReturn<T, unknown>;
	idleText: string;
	submittingText: string;
}

function FormButton<T extends FieldValues>({
	className,
	variant = "default",
	size = "default",
	form,
	idleText,
	submittingText,
	...props
}: FormButtonProps<T>) {
	const isSubmitting = form.formState.isSubmitting;

	return (
		<motion.div
			whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
			transition={{ type: "spring", stiffness: 400, damping: 20 }}
			className="w-full"
			animate={{ opacity: isSubmitting ? 0.7 : 1 }}
		>
			<Button
				{...props}
				variant={variant}
				size={size}
				type="submit"
				disabled={isSubmitting || props.disabled}
				className={`font-bold w-full hover:opacity-90 ${className}`}
			>
				{isSubmitting ? (
					<>
						<Loader className="mr-2 h-4 w-4 animate-spin" />
						{submittingText}
					</>
				) : (
					idleText
				)}
			</Button>
		</motion.div>
	);
}

export default FormButton;
