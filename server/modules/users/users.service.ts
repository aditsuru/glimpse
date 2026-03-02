import { eq } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import type { usersSchema } from "./users.schema";

export class UserService {
	constructor(private db: typeof DBType) {}

	async updateProfile({
		userId,
		...input
	}: z.infer<typeof usersSchema.updateProfile.input> & {
		userId: string;
	}): Promise<z.infer<typeof usersSchema.updateProfile.output>> {
		await this.db.update(user).set(input).where(eq(user.id, userId));
		return { success: true };
	}

	async checkAvailability({
		email,
		username,
	}: z.infer<typeof usersSchema.checkAvailability.input>): Promise<
		z.infer<typeof usersSchema.checkAvailability.output>
	> {
		const [existingEmail, existingUsername] = await Promise.all([
			this.db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.email, email))
				.limit(1),
			this.db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.username, username))
				.limit(1),
		]);
		return {
			emailTaken: existingEmail.length > 0,
			usernameTaken: existingUsername.length > 0,
		};
	}
}
