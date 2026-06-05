"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { AnimatedFieldError } from "@/components/misc/AnimatedFieldError";
import { toast } from "@/components/misc/Toast";
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
import { authClient } from "@/lib/client/auth-client";
import { cn } from "@/lib/client/utils";

const schema = z.object({
	password: z.string().min(1, "Password is required to delete your account"),
});

export const DeleteAccountDialog = ({ disabled }: { disabled: boolean }) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const { formState, handleSubmit, control, setError, clearErrors, reset } =
		useForm<z.infer<typeof schema>>({
			resolver: zodResolver(schema),
			mode: "onTouched",
			reValidateMode: "onChange",
			defaultValues: { password: "" },
		});

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			reset();
			clearErrors();
		}
		setOpen(nextOpen);
	};

	const handleFormSubmit = async (data: z.infer<typeof schema>) => {
		const { error } = await authClient.deleteUser({
			password: data.password,
		});

		if (error) {
			setError("root", {
				message:
					error.message ?? "Failed to delete account. Incorrect password?",
			});
			return;
		}

		toast.info(
			"Account deleted",
			"Your account and data have been permanently removed."
		);
		router.push("/sign-in");
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button variant="destructive" disabled={disabled}>
						{disabled ? "Set a password to delete account" : "Delete Account"}
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-md border-destructive/30">
				<DialogHeader>
					<DialogTitle className="text-xl text-destructive">
						Delete Account
					</DialogTitle>
					<DialogDescription className="text-base text-destructive">
						This action cannot be undone. All your posts, likes, and profile
						data will be permanently erased.
					</DialogDescription>
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
								name="password"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>
											Confirm Password to Delete
										</FieldLabel>
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
										variant="destructive"
										disabled={formState.isSubmitting || !formState.isDirty}
									>
										Permanently Delete
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
