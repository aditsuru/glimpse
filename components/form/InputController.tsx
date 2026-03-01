import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import type { LucideProps } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import type { Control, FieldValues, FormState, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

type LucideIcon = React.ForwardRefExoticComponent<
	Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

interface InputControllerProps<T extends FieldValues>
	extends React.InputHTMLAttributes<HTMLInputElement> {
	control: Control<T>;
	name: Path<T>;
	description?: string;
	label: string;
	formState: FormState<T>;
	type: string;
	labelSideElement?: React.ReactNode;
	InputIcon?:
		| LucideIcon
		| (HugeiconsIconProps & {
				className?: string;
		  });
}

function InputController<T extends FieldValues>({
	control,
	name,
	label,
	description,
	formState,
	type,
	labelSideElement,
	InputIcon,
	...props
}: InputControllerProps<T>) {
	const renderIcon = () => {
		if (!InputIcon) return null;

		const baseIconClass = `absolute left-2 ${formState.isSubmitting ? "opacity-50" : ""}`;

		if (isLucideIcon(InputIcon)) {
			return <InputIcon className={baseIconClass} />;
		}

		const { className: extraClass, ...hugeProps } = InputIcon;
		return (
			<HugeiconsIcon
				className={`${baseIconClass} ${extraClass ?? ""}`}
				{...hugeProps}
			/>
		);
	};
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<div className="w-full flex justify-between">
						<FieldLabel
							htmlFor={field.name}
							className={`cursor-none ${formState.isSubmitting && "opacity-50"}`}
						>
							{label}
						</FieldLabel>
						{labelSideElement}
					</div>
					{description && <FieldDescription>{description}</FieldDescription>}
					<div className="flex w-full relative items-center">
						{renderIcon()}
						<Input
							{...field}
							{...props}
							id={field.name}
							aria-invalid={fieldState.invalid}
							type={type}
							disabled={formState.isSubmitting}
							className={`cursor-none ${InputIcon ? "pl-10" : ""}`}
						/>
					</div>
					<AnimatePresence mode="wait">
						{fieldState.invalid && (
							<motion.div
								initial={{ opacity: 0, height: 0, y: -5 }}
								animate={{ opacity: 1, height: "auto", y: 0 }}
								exit={{ opacity: 0, height: 0, y: -5 }}
								transition={{
									duration: 0.25,
									ease: "easeInOut",
								}}
								className="overflow-hidden"
							>
								<div>
									<FieldError errors={[fieldState.error]} />
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</Field>
			)}
		/>
	);
}

// Helper method
const isLucideIcon = (icon: unknown): icon is LucideIcon => {
	return typeof icon === "function";
};

export default InputController;
