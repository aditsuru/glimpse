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

	if (!session) redirect("/");

	const admin = await db
		.select({ role: profilesTable.role })
		.from(profilesTable)
		.where(eq(profilesTable.userId, session.user.id))
		.limit(1)
		.then((i) => i[0])
		.then((i) => i.role === "admin");

	if (!admin) redirect("/");

	return <>{children}</>;
}
