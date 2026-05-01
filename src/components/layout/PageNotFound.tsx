import { Meh } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function PageNotFound() {
	return (
		<div className="w-screen h-dvh flex flex-col items-center justify-center gap-3 text-muted-foreground">
			<Meh className="size-12" />
			<div className="text-center">
				<p className="text-lg font-semibold text-foreground">Whoops</p>
				<p className="text-sm">
					The page you&apos;re looking for isn&apos;t found, we suggest you back
					to home.
				</p>
			</div>
			<Button className="rounded-lg text-base">
				<Link href="/">Back to home page</Link>
			</Button>
		</div>
	);
}

export default PageNotFound;
