import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../shared/auth";

export async function getRequiredSession() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	return session;
}
