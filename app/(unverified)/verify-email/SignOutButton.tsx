"use client";

import { useRouter } from "next/navigation";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/clients/auth-client";

function SignOutButton() {
	const router = useRouter();
	const handleSignOutOnClick = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/sign-in");
					router.refresh();
				},
			},
		});
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger>
				<Button variant="destructive" className="w-full px-4">
					Sign Out
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to sign out?
					</AlertDialogTitle>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleSignOutOnClick}
						variant="destructive"
					>
						Sign Out
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default SignOutButton;
