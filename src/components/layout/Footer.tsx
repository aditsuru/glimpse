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
		label: "DMCA",
		href: "/legal/dmca",
	},
];
export const Footer = () => {
	return (
		<footer className="flex w-full gap-4 py-4">
			<ul className="flex w-full justify-between">
				{links.map((item) => (
					<Link
						href={item.href}
						key={item.href}
						className="text-muted-foreground text-xs hover:underline underline-offset-4 divide-x divide-solid"
					>
						<li>{item.label}</li>
					</Link>
				))}
			</ul>
		</footer>
	);
};
