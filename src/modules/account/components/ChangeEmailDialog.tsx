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
	DialogDescription,
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
import { useCooldown } from "@/hooks/useCooldown";
import { authClient } from "@/lib/client/auth-client";
import { cn } from "@/lib/client/utils";
import { config } from "@/lib/shared/config";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";
import { useVerifyPassword } from "@/modules/account/account.queries";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";

type Step = "password" | "email";

const passwordSchema = z.object({
	password: z.string().min(1, "Password is required"),
});

const emailSchema = z.object({
	newEmail: z.email("Enter a valid email address"),
});

export const ChangeEmailDialog = () => {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<Step>("password");
	const openConfirmDialog = useConfirmDialogStore((state) => state.openDialog);
	const verifyPasswordMutation = useVerifyPassword();

	const { secondsLeft, hasTriggered, startCooldown } = useCooldown(
		LOCAL_STORAGE_KEYS.VERIFY_EMAIL_COOLDOWN,
		config.NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT
	);

	const passwordForm = useForm<z.infer<typeof passwordSchema>>({
		resolver: zodResolver(passwordSchema),
		mode: "onTouched",
		reValidateMode: "onChange",
		defaultValues: { password: "" },
	});

	const emailForm = useForm<z.infer<typeof emailSchema>>({
		resolver: zodResolver(emailSchema),
		mode: "onTouched",
		reValidateMode: "onChange",
		defaultValues: { newEmail: "" },
	});

	const resetAll = () => {
		passwordForm.reset();
		emailForm.reset();
		passwordForm.clearErrors();
		emailForm.clearErrors();
		setStep("password");
	};

	const handleOpenChange = (nextOpen: boolean) => {
		const isDirty =
			passwordForm.formState.isDirty || emailForm.formState.isDirty;
		if (!nextOpen && isDirty) {
			openConfirmDialog({
				title: "Discard Changes?",
				description: "You haven't sent the verification email yet. Discard?",
				confirmText: "Discard",
				confirmVariant: "destructive",
				onConfirm: () => {
					resetAll();
					setOpen(false);
				},
			});
		} else {
			if (!nextOpen) resetAll();
			setOpen(nextOpen);
		}
	};

	const handlePasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
		const result = await verifyPasswordMutation.mutateAsync(
			{ password: data.password },
			{
				onError: () => {
					passwordForm.setError("root", {
						message: "Failed to verify password. Please try again.",
					});
				},
			}
		);

		if (!result.valid) {
			passwordForm.setError("password", { message: "Incorrect password." });
			return;
		}

		setStep("email");
	};

	const handleEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
		const { error } = await authClient.changeEmail({
			newEmail: data.newEmail,
			callbackURL: "/",
		});

		if (error) {
			emailForm.setError("root", {
				message: error.message ?? "Failed to update email. Please try again.",
			});
			return;
		}

		startCooldown();
		toast.success("Verification link sent to your new email address.");
		resetAll();
		setOpen(false);
	};

	const isCooldownActive = secondsLeft !== null && secondsLeft > 0;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button variant="outline" size="sm">
						Change
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl">Change Email</DialogTitle>
					<DialogDescription className="text-base text-muted-foreground">
						{step === "password"
							? "Confirm your password before changing your email."
							: "We will send a verification link to your new email. Your email won't update until you verify it."}
					</DialogDescription>
				</DialogHeader>

				<AnimatePresence mode="wait">
					{step === "password" ? (
						<motion.form
							key="password-step"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
							className={cn("w-full mt-2", {
								"text-muted-foreground/60": passwordForm.formState.isSubmitting,
							})}
						>
							<fieldset
								disabled={passwordForm.formState.isSubmitting}
								className="contents"
							>
								<FieldGroup
									onFocusCapture={() => passwordForm.clearErrors("root")}
								>
									<Controller
										name="password"
										control={passwordForm.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>Password</FieldLabel>
												<Input
													{...field}
													id={field.name}
													type="password"
													autoComplete="current-password"
													aria-invalid={fieldState.invalid}
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
											{passwordForm.formState.errors.root && (
												<motion.div
													initial={{ opacity: 0, height: 0, y: 5 }}
													animate={{ opacity: 1, height: "auto", y: 0 }}
													exit={{ opacity: 0, height: 0, y: 5 }}
													transition={{ duration: 0.3, ease: "easeOut" }}
													className="mb-4"
												>
													<FieldError
														errors={[passwordForm.formState.errors.root]}
													/>
												</motion.div>
											)}
										</AnimatePresence>
										<Button
											type="submit"
											className="w-full"
											disabled={
												passwordForm.formState.isSubmitting ||
												!passwordForm.formState.isDirty
											}
										>
											{passwordForm.formState.isSubmitting ? (
												<Spinner />
											) : (
												"Continue"
											)}
										</Button>
									</div>
								</FieldGroup>
							</fieldset>
						</motion.form>
					) : (
						<motion.form
							key="email-step"
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 10 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
							className={cn("w-full mt-2", {
								"text-muted-foreground/60": emailForm.formState.isSubmitting,
							})}
						>
							<fieldset
								disabled={emailForm.formState.isSubmitting || isCooldownActive}
								className="contents"
							>
								<FieldGroup
									onFocusCapture={() => emailForm.clearErrors("root")}
								>
									<Controller
										name="newEmail"
										control={emailForm.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>
													New Email Address
												</FieldLabel>
												<Input
													{...field}
													id={field.name}
													type="email"
													aria-invalid={fieldState.invalid}
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
											{emailForm.formState.errors.root && (
												<motion.div
													initial={{ opacity: 0, height: 0, y: 5 }}
													animate={{ opacity: 1, height: "auto", y: 0 }}
													exit={{ opacity: 0, height: 0, y: 5 }}
													transition={{ duration: 0.3, ease: "easeOut" }}
													className="mb-4"
												>
													<FieldError
														errors={[emailForm.formState.errors.root]}
													/>
												</motion.div>
											)}
										</AnimatePresence>
										<Button
											type="submit"
											className="w-full"
											disabled={
												emailForm.formState.isSubmitting ||
												!emailForm.formState.isDirty ||
												isCooldownActive
											}
										>
											{emailForm.formState.isSubmitting ? (
												<Spinner />
											) : isCooldownActive ? (
												`Wait ${secondsLeft}s`
											) : hasTriggered ? (
												"Resend Verification"
											) : (
												"Send Verification"
											)}
										</Button>
									</div>
								</FieldGroup>
							</fieldset>
						</motion.form>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
};
