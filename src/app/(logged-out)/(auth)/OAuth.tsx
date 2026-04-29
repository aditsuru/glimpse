import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FieldSeparator } from "@/components/ui/field";

const OAuth = ({ disabled }: { disabled: boolean }) => {
	return (
		<div className="w-full">
			<FieldSeparator>Or continue with</FieldSeparator>
			<div className="w-full grid grid-cols-2 gap-4 mt-6">
				<Button variant="outline" className="w-full" disabled={disabled}>
					<Image
						src={"https://assets.aditsuru.com/icons/dark/github.svg"}
						width={18}
						height={18}
						alt="Github icon"
						priority
					/>
					GitHub
				</Button>
				<Button variant="outline" className="w-full" disabled={disabled}>
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
