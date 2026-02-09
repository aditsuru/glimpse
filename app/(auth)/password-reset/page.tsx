import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
function PasswordReset() {
	return (
		<div className="h-screen w-screen flex justify-center items-center">
			<Card className="w-lg">
				<CardHeader>
					<div className="flex flex-col justify-center items-center">
						<CardTitle className="text-red-500">Feature is yet to be implemented!</CardTitle>
						<CardDescription>This feature is not finished yet.</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="flex justify-center items-center">
					<Link href="/login">
						<Button variant={"ghost"}>
							Go back to login page <ArrowRight />
						</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}

export default PasswordReset;
