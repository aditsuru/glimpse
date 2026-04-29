import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldSeparator } from "@/components/ui/field";
import { authClient } from "@/lib/client/auth-client";

const OAuth = ({
	context,
	disabled,
}: {
	context: "sign-up" | "sign-in";
	disabled: boolean;
}) => {
	const handleOAuth = async (provider: "google" | "github") => {
		const { error } = await authClient.signIn.social({
			provider,
			callbackURL: "/",
			errorCallbackURL: `/${context}?error=oauth_failed`,
		});

		if (error) {
			toast.error("Failed to connect to provider. Please try again.");
		}
	};

	return (
		<div className="w-full">
			<FieldSeparator>Or continue with</FieldSeparator>
			<div className="w-full grid grid-cols-2 gap-4 mt-6">
				<Button
					variant="outline"
					className="w-full"
					disabled={disabled}
					onClick={() => handleOAuth("github")}
				>
					<Image
						src={"https://assets.aditsuru.com/icons/dark/github.svg"}
						width={18}
						height={18}
						alt="Github icon"
						priority
					/>
					GitHub
				</Button>
				<Button
					variant="outline"
					className="w-full"
					disabled={disabled}
					onClick={() => handleOAuth("google")}
				>
					<Image
						src={"https://assets.aditsuru.com/icons/google.svg"}
						width={18}
						height={18}
						alt="Google icon"
						priority
					/>
					Google
				</Button>
			</div>
		</div>
	);
};

export default OAuth;
