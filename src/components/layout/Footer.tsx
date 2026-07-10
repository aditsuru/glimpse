import Link from "next/link";

const links = [
	{
		label: "Terms of Service",
		href: "/legal/tos",
	},
	{
		label: "Privacy Policy",
		href: "/legal/privacy",
	},
	{
		label: "Community Guidelines",
		href: "/legal/guidelines",
	},
	{
		label: "Copyright",
		href: "/legal/dmca",
	},
];

export const Footer = () => {
	return (
		<footer className="flex w-full py-4">
			<ul className="flex w-full justify-end items-center gap-2">
				{links.map((item) => (
					<li
						key={item.href}
						className="flex items-center gap-2 after:content-['·'] after:text-muted-foreground/50 last:after:hidden"
					>
						<Link
							href={item.href}
							className="text-muted-foreground text-[10px] hover:underline underline-offset-4"
						>
							{item.label}
						</Link>
					</li>
				))}
			</ul>
		</footer>
	);
};
