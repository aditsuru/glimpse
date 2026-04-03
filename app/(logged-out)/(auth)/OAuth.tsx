import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldSeparator } from "@/components/ui/field";
import { authClient } from "@/lib/clients/auth-client";

function OAuth({
	context,
	isSubmitting,
}: {
	context: string;
	isSubmitting: boolean;
}) {
	const handleOAuth = async (provider: "google" | "github") => {
		const { error } = await authClient.signIn.social({
			provider,
			callbackURL: "/",
			errorCallbackURL: `/${context}?error=oauth_failed`,
		});

		if (error) {
			toast.error(error.message || "Failed to connect to provider.");
		}
	};
	return (
		<>
			<FieldSeparator>Or continue with</FieldSeparator>
			<Field className="grid gap-4 sm:grid-cols-2">
				<Button
					variant="outline"
					type="button"
					disabled={isSubmitting}
					onClick={() => handleOAuth("github")}
				>
					<SiGithub />
					GitHub
				</Button>
				<Button
					variant="outline"
					type="button"
					disabled={isSubmitting}
					onClick={() => handleOAuth("google")}
				>
					<SiGoogle />
					Google
				</Button>
			</Field>
		</>
	);
}

export default OAuth;
