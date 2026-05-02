/** biome-ignore-all lint/style/noNonNullAssertion: session is never null */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { PencilIcon, Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import * as z from "zod";
import ErrorMessage from "@/components/layout/ErrorMessage";
import PageHeader from "@/components/layout/PageHeader";
import AnimatedFieldError from "@/components/misc/AnimatedFieldError";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { authClient } from "@/lib/client/auth-client";
import { orpc } from "@/lib/client/orpc-client";
import { cn } from "@/lib/client/utils";
import {
	ALLOWED_MIME_TYPES,
	DEFAULT_PFP_URL,
	isGif,
} from "@/lib/shared/constants";
import { ProfileSkeleton } from "@/modules/profile/components/Profile";
import {
	useGetAvatarPresignedUrl,
	useGetBannerPresignedUrl,
	useIsUsernameAvailable,
	useProfile,
	useUpdateAvatar,
	useUpdateBanner,
	useUpdateProfile,
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
	bio: z.string().max(60, "Bio must be at most 60 characters"),
	pronouns: z.string().max(10, "Pronouns must be at most 10 characters"),
});

const ProfileSettings = () => {
	const { data: sessionData } = authClient.useSession();
	const {
		data: profileData,
		isLoading: isProfileLoading,
		error: profileError,
	} = useProfile({
		userId: sessionData?.user.id,
	});

	const { formState, handleSubmit, control, setError, clearErrors, reset } =
		useForm<z.infer<typeof FormSchema>>({
			resolver: zodResolver(FormSchema),
			mode: "onTouched",
			reValidateMode: "onChange",
			defaultValues: { username: "", displayName: "", bio: "", pronouns: "" },
		});

	useEffect(() => {
		if (profileData) {
			reset({
				username: profileData.username,
				displayName: profileData.displayName,
				bio: profileData.bio ?? "",
				pronouns: profileData.pronouns ?? "",
			});
		}
	}, [profileData, reset]);

	const [usernameAvailable, setUsernameAvailable] = useState(false);
	const [usernameError, setUsernameError] = useState<string | null>(null);

	const avatarInputRef = useRef<HTMLInputElement>(null);
	const bannerInputRef = useRef<HTMLInputElement>(null);

	const isUsernameAvailable = useIsUsernameAvailable();
	const getAvatarPresignedUrl = useGetAvatarPresignedUrl();
	const getBannerPresignedUrl = useGetBannerPresignedUrl();
	const updateProfile = useUpdateProfile();
	const updateAvatar = useUpdateAvatar();
	const updateBanner = useUpdateBanner();

	const queryClient = useQueryClient();

	const {
		preview: avatarPreview,
		tempKey: avatarTempKey,
		isUploading: isAvatarUploading,
		handleFileChange: handleAvatarFileChange,
		reset: avatarReset,
	} = useMediaUpload({
		allowedMimeTypes: ALLOWED_MIME_TYPES.avatar,
		defaultPreview: profileData?.avatarUrl ?? DEFAULT_PFP_URL,
		getPresignedUrl: (mimeType) =>
			getAvatarPresignedUrl.mutateAsync({
				mimeType: mimeType as (typeof ALLOWED_MIME_TYPES.avatar)[number],
			}),
	});

	const {
		preview: bannerPreview,
		tempKey: bannerTempKey,
		mimeType: bannerMimeType,
		isUploading: isBannerUploading,
		handleFileChange: handleBannerFileChange,
		reset: bannerReset,
	} = useMediaUpload({
		allowedMimeTypes: ALLOWED_MIME_TYPES.banner,
		defaultPreview: profileData?.bannerUrl ?? "",
		getPresignedUrl: (mimeType) =>
			getBannerPresignedUrl.mutateAsync({
				mimeType: mimeType as (typeof ALLOWED_MIME_TYPES.banner)[number],
			}),
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
		if (usernameError || isUsernameAvailable.isPending) return;

		const trimmedBio = formData.bio.trim();

		const hasProfileChanges =
			formData.username !== profileData?.username ||
			formData.displayName !== profileData?.displayName ||
			trimmedBio !== (profileData?.bio ?? "") ||
			formData.pronouns !== (profileData?.pronouns ?? "");

		if (!hasProfileChanges && !avatarTempKey && !bannerTempKey) {
			toast.info("No changes to save.");
			return;
		}

		try {
			if (hasProfileChanges)
				await updateProfile.mutateAsync({
					username:
						formData.username !== profileData?.username
							? formData.username
							: undefined,
					displayName:
						formData.displayName !== profileData?.displayName
							? formData.displayName
							: undefined,
					bio: trimmedBio !== (profileData?.bio ?? "") ? trimmedBio : undefined,
					pronouns:
						formData.pronouns !== profileData?.pronouns
							? formData.pronouns
							: undefined,
				});

			if (avatarTempKey) await updateAvatar.mutateAsync({ key: avatarTempKey });

			if (bannerTempKey && bannerMimeType)
				await updateBanner.mutateAsync({
					key: bannerTempKey,
					mimeType:
						bannerMimeType as (typeof ALLOWED_MIME_TYPES.banner)[number],
				});

			toast.success("Profile updated successfully!");

			await Promise.all([
				queryClient.refetchQueries(
					orpc.profile.get.queryOptions({
						input: { userId: sessionData?.user.id },
					})
				),
				queryClient.refetchQueries(
					orpc.profile.get.queryOptions({
						input: { username: profileData?.username },
					})
				),
			]);

			if (formData.username !== profileData?.username) {
				await queryClient.refetchQueries(
					orpc.profile.get.queryOptions({
						input: { username: formData.username },
					})
				);
			}

			avatarReset();
			bannerReset();
		} catch {
			setError("root", { message: "Something went wrong, please try again" });
		}
	};

	if (isProfileLoading) return <ProfileSkeleton />;
	if (profileError) return <ErrorMessage />;
	if (!profileData) return null;

	const isAnythingUploading = isAvatarUploading || isBannerUploading;

	return (
		<div className="w-full overflow-y-auto scrollbar-none mb-8">
			<PageHeader title="Edit Profile" />
			<div className="relative">
				{/* Banner */}
				<div className="relative">
					<button
						type="button"
						className="w-full"
						onClick={() => bannerInputRef.current?.click()}
					>
						<AspectRatio
							ratio={3 / 1}
							className="overflow-hidden bg-accent group"
						>
							{bannerPreview && (
								<Image
									src={bannerPreview}
									alt="banner"
									fill
									unoptimized={isGif(
										bannerMimeType ?? profileData.bannerMimeType ?? ""
									)}
									className="object-cover object-center"
									priority
								/>
							)}
							<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<PencilIcon className="size-6 text-white" />
							</div>
						</AspectRatio>
					</button>

					{bannerTempKey && !isBannerUploading && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								bannerReset();
							}}
							className="absolute top-2 right-2 bg-destructive rounded-full p-2 hover:brightness-75"
						>
							<Trash className="size-5 text-white" />
						</button>
					)}
				</div>

				<input
					ref={bannerInputRef}
					type="file"
					accept={ALLOWED_MIME_TYPES.banner.join(",")}
					className="hidden"
					onChange={handleBannerFileChange}
				/>

				{/* Avatar */}
				<div className="px-4">
					<div className="absolute -translate-y-1/2">
						<div className="relative">
							<button
								type="button"
								onClick={() => avatarInputRef.current?.click()}
								className="relative"
							>
								<Avatar className="size-30 ring-4 ring-background">
									<AvatarImage src={avatarPreview} />
								</Avatar>
								{isAvatarUploading ? (
									<div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
										<Spinner className="size-8" />
									</div>
								) : (
									<div className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
										<PencilIcon className="size-5 text-white" />
									</div>
								)}
							</button>
							{avatarTempKey && !isAvatarUploading && (
								<button
									type="button"
									onClick={avatarReset}
									className="absolute -top-1 -right-1 bg-destructive rounded-full p-2 hover:brightness-75"
								>
									<Trash className="size-5 text-white" />
								</button>
							)}
						</div>
						<input
							ref={avatarInputRef}
							type="file"
							accept={ALLOWED_MIME_TYPES.avatar.join(",")}
							className="hidden"
							onChange={handleAvatarFileChange}
						/>
					</div>
				</div>
			</div>

			<form
				onSubmit={handleSubmit(handleFormSubmit)}
				className={cn("w-full mt-[90px] px-12", {
					"text-muted-foreground/60": formState.isSubmitting,
				})}
			>
				<fieldset
					disabled={formState.isSubmitting || isAnythingUploading}
					className="contents"
				>
					<FieldGroup onFocusCapture={() => clearErrors("root")}>
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
										className={cn({ "text-success": usernameAvailable })}
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
						{/* Bio */}
						<Controller
							name="bio"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Bio</FieldLabel>
									<Textarea
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										rows={3}
										className="resize-none"
									/>
									<AnimatedFieldError
										invalid={fieldState.invalid}
										errors={fieldState.error}
									/>
								</Field>
							)}
						/>
						{/* Pronouns */}
						<Controller
							name="pronouns"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Pronouns</FieldLabel>
									<Input
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										type="text"
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
										className="mb-2"
									>
										<FieldError
											errors={[formState.errors.root]}
											className="text-base"
										/>
									</motion.div>
								)}
							</AnimatePresence>
							<Button
								type="submit"
								disabled={
									formState.isSubmitting ||
									isAnythingUploading ||
									isUsernameAvailable.isPending
								}
								className="w-full"
							>
								{formState.isSubmitting ? <Spinner /> : "Save"}
							</Button>
						</div>
					</FieldGroup>
				</fieldset>
			</form>
		</div>
	);
};

export default ProfileSettings;
