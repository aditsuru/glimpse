import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profilesTable } from "@/db/schema";
import { auth } from "@/lib/server/auth";

export default async function AuthGuard({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (session) {
		const profile = await db
			.select({ username: profilesTable.username })
			.from(profilesTable)
			.where(eq(profilesTable.userId, session.user.id))
			.then((i) => i[0]);

		if (!profile) redirect("/onboarding");
	}

	return <>{children}</>;
}
