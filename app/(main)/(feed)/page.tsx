import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function page() {
	return (
		<div>
			<Card className="mt-8 flex gap-0 shadow-none border-none bg-background">
				<CardHeader>
					<div className="flex flex-col lg:flex-row items-start gap-2">
						<div className="flex items-start">
							<Avatar className="w-12 h-12">
								<AvatarImage src="https://github.com/shadcn.png" />
								<AvatarFallback>LM</AvatarFallback>
							</Avatar>
							<CardTitle className="font-bold lg:hidden mx-4 text-xl">
								Lorem, ipsum.
							</CardTitle>
						</div>
						<div className="flex flex-col gap-2 lg:mx-2">
							<CardTitle className="font-semibold hidden lg:block">
								Lorem, ipsum.
							</CardTitle>
							<CardDescription className="text-foreground text-md">
								Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum
								qui praesentium animi repellendus ex laboriosam minima! Omnis
								dolorum consequatur nam sint id. Optio.
							</CardDescription>

							<AspectRatio ratio={16 / 9}>
								<Skeleton className="aspect-video w-full" />
							</AspectRatio>
						</div>
					</div>
				</CardHeader>
			</Card>
		</div>
	);
}

export default page;
