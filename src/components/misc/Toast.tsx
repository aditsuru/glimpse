"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { cn } from "@/lib/client/utils";

type ToastType = "success" | "error" | "info";

interface ToastProps {
	id: string | number;
	type: ToastType;
	title: string;
	description?: string;
}

const TYPE_MAP = {
	success: {
		icon: CircleCheck,
		iconClass: "text-green-400",
		borderClass: "border-green-500/20",
		bgClass: "bg-green-500/5",
	},
	error: {
		icon: CircleAlert,
		iconClass: "text-red-400",
		borderClass: "border-red-500/20",
		bgClass: "bg-red-500/5",
	},
	info: {
		icon: Info,
		iconClass: "text-blue-400",
		borderClass: "border-blue-500/20",
		bgClass: "bg-blue-500/5",
	},
} as const;

const ToastComponent = ({ id, type, title, description }: ToastProps) => {
	const { icon: Icon, iconClass, borderClass, bgClass } = TYPE_MAP[type];

	return (
		<div
			role="alert"
			aria-live="polite"
			className={cn(
				"flex rounded-lg border w-full md:w-[400px] items-start gap-3 p-4 bg-background shadow-lg",
				borderClass,
				bgClass
			)}
		>
			<Icon className={cn("size-5 shrink-0 mt-0.5", iconClass)} />
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-foreground">{title}</p>
				{description && (
					<p className="text-sm text-muted-foreground mt-0.5">{description}</p>
				)}
			</div>
			<button
				type="button"
				onClick={() => sonnerToast.dismiss(id)}
				className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
			>
				<X className="size-4" />
			</button>
		</div>
	);
};

export const toast = {
	success: (title: string, description?: string) =>
		sonnerToast.custom((id) => (
			<ToastComponent
				id={id}
				type="success"
				title={title}
				description={description}
			/>
		)),
	error: (title: string, description?: string) =>
		sonnerToast.custom((id) => (
			<ToastComponent
				id={id}
				type="error"
				title={title}
				description={description}
			/>
		)),
	info: (title: string, description?: string) =>
		sonnerToast.custom((id) => (
			<ToastComponent
				id={id}
				type="info"
				title={title}
				description={description}
			/>
		)),
};
