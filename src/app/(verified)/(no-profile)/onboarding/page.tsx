"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ORPCError } from "@orpc/client";
import { PencilIcon, Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import * as z from "zod";
import AnimatedFieldError from "@/components/misc/AnimatedFieldError";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { cn } from "@/lib/client/utils";
import { ALLOWED_MIME_TYPES } from "@/lib/shared/constants";
import {
	useGetAvatarPresignedUrl,
	useIsUsernameAvailable,
	useOnboard,
} from "@/modules/profile/profile.queries";

const FormSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(20, "Username must be at most 20 characters")
		.regex(
			/^[a-zA-Z0-9_]+$/,
			"Username can only contain letters, numbers and underscores"
		),
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(20, "Display name must be at most 20 characters")
		.regex(
			/^[a-zA-Z0-9_ ]+$/,
			"Display name can only contain letters, numbers, underscores and spaces"
		),
});

const Onboarding = () => {
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [usernameAvailable, setUsernameAvailable] = useState(false);
	const [usernameError, setUsernameError] = useState<string | null>(null);

	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const isUsernameAvailable = useIsUsernameAvailable();
	const onboard = useOnboard();
	const getAvatarPresignedUrl = useGetAvatarPresignedUrl();

	const { preview, tempKey, isUploading, handleFileChange, reset } =
		useMediaUpload({
			allowedMimeTypes: ALLOWED_MIME_TYPES.avatar,
			getPresignedUrl: (mimeType) =>
				getAvatarPresignedUrl.mutateAsync({
					mimeType: mimeType as (typeof ALLOWED_MIME_TYPES.avatar)[number],
				}),
		});

	const { formState, handleSubmit, control, setError, clearErrors } = useForm<
		z.infer<typeof FormSchema>
	>({
		resolver: zodResolver(FormSchema),
		mode: "onTouched",
		reValidateMode: "onChange",
		defaultValues: {
			username: "",
			displayName: "",
		},
	});

	const checkUsername = useDebouncedCallback(async (value: string) => {
		if (value.length < 3) return;
		try {
			const { available } = await isUsernameAvailable.mutateAsync({
				username: value,
			});
			if (!available) {
				setUsernameError("Username already taken");
				setUsernameAvailable(false);
			} else {
				setUsernameError(null);
				setUsernameAvailable(true);
			}
		} catch {
			setUsernameError("Couldn't verify username, please try again");
			setUsernameAvailable(false);
		}
	}, 500);

	const handleFormSubmit = async (formData: z.infer<typeof FormSchema>) => {
		if (usernameError || isUsernameAvailable.isPending || !usernameAvailable)
			return;
		try {
			await onboard.mutateAsync({
				...formData,
				avatarKey: tempKey ?? undefined,
			});
			setIsRedirecting(true);
			toast.success("Profile created successfully!");
			router.push("/");
		} catch (e) {
			let message = "Something went wrong, please try again";

			if (e instanceof ORPCError) {
				message = e.message;
			}
			setError("root", { message });
		}
	};

	return (
		<main className="h-dvh w-screen flex justify-center items-center overflow-hidden">
			<Card className="w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Let's get you started!</CardTitle>
					<CardDescription>Complete your profile to continue.</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(handleFormSubmit)}
						className={cn("w-full mt-4", {
							"text-muted-foreground/60":
								formState.isSubmitting || isRedirecting,
						})}
					>
						<fieldset
							disabled={formState.isSubmitting || isRedirecting || isUploading}
							className="contents"
						>
							<FieldGroup onFocusCapture={() => clearErrors("root")}>
								<Field>
									<div className="w-full flex justify-center">
										<div className="relative">
											<button
												type="button"
												disabled={
													formState.isSubmitting || isRedirecting || isUploading
												}
												className="relative"
												onClick={() => inputRef.current?.click()}
											>
												<Avatar className="size-32 transition-all">
													<AvatarImage src={preview} />
												</Avatar>
												{isUploading ? (
													<div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
														<Spinner className="size-8" />
													</div>
												) : (
													<div className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
														<PencilIcon className="size-5 text-white" />
													</div>
												)}
											</button>

											{tempKey && !isUploading && (
												<button
													type="button"
													onClick={reset}
													className="absolute -top-1 -right-1 bg-destructive rounded-full p-2 hover:brightness-90"
												>
													<Trash className="size-5 text-white" />
												</button>
											)}
										</div>

										<input
											ref={inputRef}
											type="file"
											accept={ALLOWED_MIME_TYPES.avatar.join(",")}
											className="hidden"
											onChange={handleFileChange}
										/>
									</div>
								</Field>
								{/* Display Name */}
								<Controller
									name="displayName"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
											<Input
												{...field}
												id={field.name}
												aria-invalid={fieldState.invalid}
												type="text"
												autoComplete="name"
											/>

											<AnimatedFieldError
												invalid={fieldState.invalid}
												errors={fieldState.error}
											/>
										</Field>
									)}
								/>
								{/* Username */}
								<Controller
									name="username"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid || !!usernameError}>
											<FieldLabel
												htmlFor={field.name}
												className={cn({
													"text-success": usernameAvailable,
												})}
											>
												Username
											</FieldLabel>
											<Input
												{...field}
												id={field.name}
												aria-invalid={fieldState.invalid || !!usernameError}
												type="text"
												autoComplete="username"
												onChange={(e) => {
													setUsernameAvailable(false);
													setUsernameError(null);
													field.onChange(e);
													checkUsername(e.target.value);
												}}
												className={cn({
													"focus-visible:ring-success/40 ring-success/40 ring-3":
														usernameAvailable,
												})}
											/>

											<AnimatedFieldError
												invalid={fieldState.invalid}
												errors={fieldState.error}
											/>
											<AnimatedFieldError
												invalid={!!usernameError}
												errors={
													usernameError ? { message: usernameError } : undefined
												}
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
												transition={{
													duration: 0.3,
													ease: "easeOut",
												}}
												className="mb-2"
											>
												<FieldError errors={[formState.errors.root]} />
											</motion.div>
										)}
									</AnimatePresence>
									<Button
										type="submit"
										disabled={
											formState.isSubmitting ||
											isRedirecting ||
											isUploading ||
											isUsernameAvailable.isPending ||
											!usernameAvailable
										}
										className="w-full"
									>
										{formState.isSubmitting || isRedirecting ? (
											<Spinner />
										) : (
											"Continue"
										)}
									</Button>
								</div>
							</FieldGroup>
						</fieldset>
					</form>
				</CardContent>
			</Card>
		</main>
	);
};

export default Onboarding;
