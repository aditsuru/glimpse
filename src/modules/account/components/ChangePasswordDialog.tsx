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
import { useCooldown } from "@/hooks/useCooldown";
import { authClient } from "@/lib/client/auth-client";
import { cn } from "@/lib/client/utils";
import { config } from "@/lib/shared/config";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";

const schema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
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

export const ChangePasswordDialog = ({ email }: { email: string }) => {
	const [open, setOpen] = useState(false);
	const [isSendingReset, setIsSendingReset] = useState(false);
	const openConfirmDialog = useConfirmDialogStore((state) => state.openDialog);

	const { secondsLeft, hasTriggered, startCooldown } = useCooldown(
		LOCAL_STORAGE_KEYS.FORGOT_PASSWORD_COOLDOWN,
		config.NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT
	);

	const { formState, handleSubmit, control, setError, clearErrors, reset } =
		useForm<z.infer<typeof schema>>({
			resolver: zodResolver(schema),
			mode: "onTouched",
			reValidateMode: "onChange",
			defaultValues: {
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			},
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
		const { error } = await authClient.changePassword({
			newPassword: data.newPassword,
			currentPassword: data.currentPassword,
			revokeOtherSessions: true,
		});

		if (error) {
			setError("root", {
				message:
					error.message ?? "Failed to change password. Please try again.",
			});
			return;
		}

		toast.success("Password updated successfully.");
		reset();
		setOpen(false);
	};

	const handleForgotPassword = async () => {
		setIsSendingReset(true);
		const { error } = await authClient.requestPasswordReset({
			email,
			redirectTo: "/reset-password",
		});
		setIsSendingReset(false);

		if (error) {
			toast.error("Failed to send reset email.");
		} else {
			startCooldown();
			toast.success("Password reset link sent to your email.");
		}
	};

	const isCooldownActive = secondsLeft !== null && secondsLeft > 0;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={<Button variant="outline">Change Password</Button>}
			/>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl">Change Password</DialogTitle>
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
								name="currentPassword"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<div className="flex justify-between items-center">
											<FieldLabel htmlFor={field.name}>
												Current Password
											</FieldLabel>
											<button
												type="button"
												onClick={handleForgotPassword}
												disabled={
													isSendingReset ||
													formState.isSubmitting ||
													isCooldownActive
												}
												className={cn("transition-colors", {
													"text-muted-foreground hover:text-primary hover:underline":
														!isCooldownActive,
													"text-muted-foreground/50 cursor-not-allowed":
														isCooldownActive,
												})}
											>
												{isSendingReset
													? "Sending..."
													: isCooldownActive
														? `Wait ${secondsLeft}s`
														: hasTriggered
															? "Resend reset link"
															: "Forgot password?"}
											</button>
										</div>
										<Input
											{...field}
											id={field.name}
											type="password"
											aria-invalid={fieldState.invalid}
										/>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

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
								<div className="flex justify-end">
									<Button
										type="submit"
										disabled={formState.isSubmitting || !formState.isDirty}
									>
										Save Password
									</Button>
								</div>
							</div>
						</FieldGroup>
					</fieldset>
				</form>
			</DialogContent>
		</Dialog>
	);
};
