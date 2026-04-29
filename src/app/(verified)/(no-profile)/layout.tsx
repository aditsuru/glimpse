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
		const [profile] = await db
			.select()
			.from(profilesTable)
			.where(eq(profilesTable.userId, session.user.id));

		if (profile) redirect("/");
	}

	return <>{children}</>;
}
