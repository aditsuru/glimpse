import Link from "next/link";
import { Button } from "@/components/ui/button";

function PageNotFound() {
	return (
		<div className="h-screen">
			<div className="flex flex-col items-center justify-center px-4 py-8 text-center h-full">
				<h2 className="mb-4 text-4xl font-semibold">Whoops!</h2>
				<p className="text-muted-foreground mb-6 max-w-sm">
					The page you&apos;re looking for isn&apos;t found, we suggest you back
					to home.
				</p>
				<Button size="lg" className="rounded-lg text-base">
					<Link href="/">Back to home page</Link>
				</Button>
			</div>
		</div>
	);
}

export default PageNotFound;
