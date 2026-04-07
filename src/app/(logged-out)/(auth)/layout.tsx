import Link from "next/link";
import { FieldDescription, FieldGroup } from "@/components/ui/field";

function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
			<div className="w-full max-w-sm">
				<FieldGroup>{children}</FieldGroup>
				<FieldDescription className="px-4 text-center mt-4!">
					By clicking continue, you agree to our{" "}
					<Link href="#">Terms of Service</Link> and{" "}
					<Link href="#">Privacy Policy</Link>.
				</FieldDescription>
			</div>
		</div>
	);
}

export default AuthLayout;
