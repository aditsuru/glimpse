import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bansTable } from "@/db/schema";
import { auth } from "@/lib/server/auth";

export default async function AuthGuard({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) {
		redirect("/sign-in");
	}

	const ban = await db
		.select({ id: bansTable.id })
		.from(bansTable)
		.where(eq(bansTable.email, session.user.email))
		.limit(1)
		.then((i) => i[0]);

	if (ban) redirect("/banned");

	if (!session.user.emailVerified) {
		redirect("/verify-email");
	}

	return <>{children}</>;
}
