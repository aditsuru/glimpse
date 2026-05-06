"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/client/utils";
import { Button } from "../ui/button";

type PageHeaderProps = {
	title: string;
	className?: string;
};

const PageHeader = ({ title, className }: PageHeaderProps) => {
	const router = useRouter();
	return (
		<div
			className={cn(
				"px-4 border-b border-accent sticky top-0 bg-background/80 backdrop-blur-sm z-10",
				className
			)}
		>
			<div className="flex items-center gap-4 h-18">
				<Button
					variant="ghost"
					onClick={() => router.back()}
					className="rounded-full p-2 hover:bg-accent transition-colors"
				>
					<ChevronLeft className="size-5" />
				</Button>
				<h1 className="text-xl font-bold">{title}</h1>
			</div>
		</div>
	);
};

export default PageHeader;
