"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { AnimatedFieldError } from "@/components/misc/AnimatedFieldError";
import { toast } from "@/components/misc/Toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/client/utils";
import { useCreateDmcaRequest } from "@/modules/dmca/dmca.queries";

const dmcaFormSchema = z.object({
	fullName: z
		.string({ error: "Full legal name is required" })
		.min(2, "Full legal name is required."),
	email: z.email("Email must be valid"),
	address: z
		.string({ error: "Address is required" })
		.min(10, "A complete physical address is required."),
	phone: z.string().optional(),
	copyrightedWorkDescription: z
		.string({ error: "This field is required" })
		.min(20, "Please describe the copyrighted work in detail."),
	infringingUrl: z.url("Please provide a valid URL."),
	additionalContext: z.string().optional(),
	goodFaithStatement: z.literal(true, {
		message: "This statement is required.",
	}),
	perjuryStatement: z.literal(true, {
		message: "This statement is required.",
	}),
	signature: z
		.string({ error: "Electronic signature is required" })
		.min(2, "Electronic signature is required."),
});

export default function DmcaPage() {
	const createDmca = useCreateDmcaRequest();
	const router = useRouter();

	const { formState, handleSubmit, control, setError, clearErrors, reset } =
		useForm<z.infer<typeof dmcaFormSchema>>({
			resolver: zodResolver(dmcaFormSchema),
			mode: "onTouched",
			reValidateMode: "onChange",
			defaultValues: {
				fullName: "",
				email: "",
				address: "",
				phone: "",
				copyrightedWorkDescription: "",
				infringingUrl: "",
				additionalContext: "",
				goodFaithStatement: false as unknown as true,
				perjuryStatement: false as unknown as true,
				signature: "",
			},
		});

	const handleFormSubmit = async (formData: z.infer<typeof dmcaFormSchema>) => {
		createDmca.mutate(formData, {
			onSuccess: () => {
				toast.success(
					"Notice submitted",
					"We've received your DMCA takedown request and will review it within a few business days."
				);
				reset();
			},
			onError: (error) => {
				setError("root", {
					message: error.message ?? "Something went wrong. Please try again.",
				});
			},
		});
	};

	return (
		<div className="max-w-2xl mx-auto py-12 px-4 flex flex-col gap-10">
			<div className="flex flex-col gap-4">
				<div>
					<Button
						variant="ghost"
						className="px-0 hover:bg-transparent! hover:underline underline-offset-4"
						onClick={() => {
							router.back();
						}}
					>
						<ChevronLeft /> Go Back
					</Button>
				</div>
				<h1 className="text-2xl font-bold">DMCA Takedown Policy</h1>
				<p className="text-muted-foreground leading-relaxed">
					Glimpse respects the intellectual property rights of others and
					expects users to do the same. If you believe content on our platform
					infringes your copyright, you may submit a takedown notice using the
					form below.
				</p>
				<p className="text-muted-foreground leading-relaxed">
					To be effective, your notice must include accurate contact
					information, a description of the copyrighted work, the exact URL of
					the infringing content, and a signed statement made under penalty of
					perjury. Submitting a false claim may expose you to legal liability.
				</p>
				<p className="text-muted-foreground leading-relaxed">
					Once a valid notice is received, we will remove or disable access to
					the reported content and notify the uploader, who may submit a
					counter-notice if they believe the removal was made in error.
				</p>
			</div>

			<FieldGroup>
				<form
					onSubmit={handleSubmit(handleFormSubmit)}
					className={cn("w-full flex flex-col gap-5", {
						"text-muted-foreground/60": formState.isSubmitting,
					})}
				>
					<h2 className="text-lg font-semibold">Submit a DMCA Notice</h2>

					<fieldset disabled={formState.isSubmitting} className="contents">
						<FieldGroup onFocusCapture={() => clearErrors("root")}>
							<Controller
								name="fullName"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>
											Full legal name
										</FieldLabel>
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="Jane Doe"
										/>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<Controller
								name="email"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>Email address</FieldLabel>
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											type="email"
											placeholder="jane@company.com"
										/>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<Controller
								name="address"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>
											Physical address
										</FieldLabel>
										<Textarea
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="Street, city, state, postal code, country"
											className="min-h-20"
										/>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<Controller
								name="phone"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>
											Phone number (optional)
										</FieldLabel>
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="+1 555 555 5555"
										/>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<Controller
								name="copyrightedWorkDescription"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>
											Description of the copyrighted work
										</FieldLabel>
										<Textarea
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="e.g. Original animation series 'Example Anime', episodes 1-12, copyright registered under..."
											className="min-h-24"
										/>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<Controller
								name="infringingUrl"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>
											URL of the infringing content on Glimpse
										</FieldLabel>
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="https://glimpse.aditsuru.com/p/..."
										/>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<Controller
								name="additionalContext"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>
											Additional context (optional)
										</FieldLabel>
										<Textarea
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											className="min-h-20"
										/>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<Controller
								name="goodFaithStatement"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<div className="flex items-start gap-2">
											<Checkbox
												id={field.name}
												checked={field.value}
												onCheckedChange={(checked) =>
													field.onChange(checked === true)
												}
												aria-invalid={fieldState.invalid}
											/>
											<Label
												htmlFor={field.name}
												className="text-sm leading-snug font-normal"
											>
												I have a good faith belief that use of the copyrighted
												material described above is not authorized by the
												copyright owner, its agent, or the law.
											</Label>
										</div>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<Controller
								name="perjuryStatement"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<div className="flex items-start gap-2">
											<Checkbox
												id={field.name}
												checked={field.value}
												onCheckedChange={(checked) =>
													field.onChange(checked === true)
												}
												aria-invalid={fieldState.invalid}
											/>
											<Label
												htmlFor={field.name}
												className="text-sm leading-snug font-normal"
											>
												I swear, under penalty of perjury, that the information
												in this notice is accurate and that I am the copyright
												owner or authorized to act on their behalf.
											</Label>
										</div>
										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>

							<Controller
								name="signature"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>
											Electronic signature (type your full legal name)
										</FieldLabel>
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="Jane Doe"
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
											<FieldError errors={[formState.errors.root]} />
										</motion.div>
									)}
								</AnimatePresence>
								<Button
									type="submit"
									disabled={formState.isSubmitting}
									className="w-full"
								>
									{formState.isSubmitting ? <Spinner /> : "Submit DMCA Notice"}
								</Button>
							</div>
						</FieldGroup>
					</fieldset>
				</form>
			</FieldGroup>
		</div>
	);
}
