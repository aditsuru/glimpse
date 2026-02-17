import type { LucideProps } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

type LucideIcon = React.ForwardRefExoticComponent<
	Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

interface ControllerInputProps<T extends FieldValues>
	extends React.InputHTMLAttributes<HTMLInputElement> {
	control: Control<T>;
	name: Path<T>;
	label?: string;
	labelRight?: React.ReactNode;
	description?: string;
	Icon?: LucideIcon;
}

function ControllerInput<T extends FieldValues>({
	control,
	name,
	label,
	labelRight,
	description,
	Icon,
	type = "text",
	className,
	...props
}: ControllerInputProps<T>) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState, formState: { isSubmitting } }) => (
				<Field data-invalid={fieldState.invalid}>
					<div className="flex justify-between items-center">
						{label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
						{labelRight && <div>{labelRight}</div>}
					</div>
					{description && <FieldDescription>{description}</FieldDescription>}

					<div className="flex items-center relative">
						{Icon && (
							<Icon
								className={`absolute w-10 h-6 z-10 ${isSubmitting ? "opacity-50" : ""}`}
							/>
						)}
						<Input
							{...field}
							{...props}
							id={field.name}
							type={type}
							disabled={isSubmitting || props.disabled}
							aria-invalid={fieldState.invalid}
							className={`${Icon ? "pl-10" : ""} ${className}`}
						/>
					</div>

					<div className="flex flex-col">
						<AnimatePresence mode="wait">
							{fieldState.error && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.2 }}
								>
									<FieldError errors={[fieldState.error]} />
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</Field>
			)}
		/>
	);
}

export default ControllerInput;
