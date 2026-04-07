import { SiGithub } from "@icons-pack/react-simple-icons";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { FieldSeparator } from "../ui/field";
import { Separator } from "../ui/separator";

interface TechItem {
	label: string;
	url: string;
	size?: number;
}

const techStack: TechItem[] = [
	{
		label: "TypeScript",
		url: "typescript",
		size: 34,
	},
	{
		label: "Next.js",
		url: "dark/nextjs",
	},
	{
		label: "Tailwind CSS",
		url: "tailwindcss",
	},
	{
		label: "shadcn/ui",
		url: "dark/shadcn-ui",
		size: 34,
	},
	{
		label: "TanStack",
		url: "tanstack",
	},
	{
		label: "Motion",
		url: "dark/motion",
	},
	{
		label: "Drizzle",
		url: "dark/drizzle-orm",
	},
	{
		label: "Better-Auth",
		url: "dark/better-auth",
		size: 34,
	},
	{
		label: "Neon",
		url: "neon",
		size: 34,
	},

	{
		label: "oRPC",
		url: "trpc",
	},
	{
		label: "Redis",
		url: "redis",
	},
	{
		label: "Amazon S3",
		url: "aws-s3",
	},
	{
		label: "Cloudflare R2",
		url: "cloudflare",
	},
	{
		label: "Upstash",
		url: "upstash",
		size: 34,
	},
];

function TechStack() {
	return (
		<div>
			<FieldSeparator>Built with</FieldSeparator>
			<div className="flex flex-wrap items-center justify-between py-6 gap-4">
				{techStack.map((item) => {
					const iconSize = item.size ?? 38;

					return (
						<Tooltip key={item.label}>
							<TooltipTrigger
								render={
									<Image
										src={`https://assets.aditsuru.com/icons/${item.url}.svg`}
										width={iconSize}
										height={iconSize}
										alt={item.label}
										priority
									/>
								}
							/>
							<TooltipContent>
								<p className="text-sm font-medium">{item.label}</p>
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>
			<div className="flex items-center w-full gap-4">
				<Separator className="flex-1" />

				<Link
					href="https://github.com/aditsuru/glimpse"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Button variant="ghost" type="button" className="shrink-0">
						<SiGithub className="size-5" />
						GitHub
						<ExternalLink className="size-3.5" />
					</Button>
				</Link>
				<Separator className="flex-1" />
			</div>
		</div>
	);
}

export default TechStack;
