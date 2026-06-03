"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AnimatedFieldError } from "@/components/misc/AnimatedFieldError";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/client/utils";
import { useSetPassword } from "@/modules/account/account.queries";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";

const schema = z
	.object({
		newPassword: z
			.string({ error: "Password is required" })
			.min(8, "Password must be 8 characters long")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z
			.string({ error: "Confirm password is required" })
			.min(1, "Confirm password is required"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export const SetPasswordDialog = () => {
	const [open, setOpen] = useState(false);
	const openConfirmDialog = useConfirmDialogStore((state) => state.openDialog);
	const setPasswordMutation = useSetPassword();

	const { formState, handleSubmit, control, setError, clearErrors, reset } =
		useForm<z.infer<typeof schema>>({
			resolver: zodResolver(schema),
			mode: "onTouched",
			reValidateMode: "onChange",
			defaultValues: { newPassword: "", confirmPassword: "" },
		});

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen && formState.isDirty) {
			openConfirmDialog({
				title: "Discard Changes?",
				description: "You haven't saved your new password. Discard changes?",
				confirmText: "Discard",
				confirmVariant: "destructive",
				onConfirm: () => {
					reset();
					clearErrors();
					setOpen(false);
				},
			});
		} else {
			if (!nextOpen) {
				reset();
				clearErrors();
			}
			setOpen(nextOpen);
		}
	};

	const handleFormSubmit = async (data: z.infer<typeof schema>) => {
		try {
			await setPasswordMutation.mutateAsync({ newPassword: data.newPassword });
			toast.success("Password set successfully.");
			reset();
			setOpen(false);
		} catch {
			setError("root", {
				message: "Failed to set password. Please try again.",
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button
						variant="outline"
						size="sm"
						className="border-yellow-500/50 hover:bg-yellow-500/20 text-yellow-500"
					>
						Set Password
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl">Set a Password</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(handleFormSubmit)}
					className={cn("w-full mt-2", {
						"text-muted-foreground/60": formState.isSubmitting,
					})}
				>
					<fieldset disabled={formState.isSubmitting} className="contents">
						<FieldGroup onFocusCapture={() => clearErrors("root")}>
							<Controller
								name="newPassword"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>New Password</FieldLabel>

										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											type="password"
											autoComplete="new-password"
										/>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<Controller
								name="confirmPassword"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>
											Confirm Password
										</FieldLabel>

										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											type="password"
											autoComplete="new-password"
										/>

										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<div className="w-full">
								<AnimatePresence mode="wait">
									{formState.errors.root && (
										<motion.div
											initial={{ opacity: 0, height: 0, y: 5 }}
											animate={{ opacity: 1, height: "auto", y: 0 }}
											exit={{ opacity: 0, height: 0, y: 5 }}
											transition={{ duration: 0.3, ease: "easeOut" }}
											className="mb-4"
										>
											<FieldError errors={[formState.errors.root]} />
										</motion.div>
									)}
								</AnimatePresence>

								<Button
									type="submit"
									className="w-full"
									disabled={formState.isSubmitting || !formState.isDirty}
								>
									{formState.isSubmitting ? <Spinner /> : "Set Password"}
								</Button>
							</div>
						</FieldGroup>
					</fieldset>
				</form>
			</DialogContent>
		</Dialog>
	);
};
