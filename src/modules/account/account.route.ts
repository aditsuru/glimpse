import { authedProcedure, base } from "@/server/os";
import { accountSchema } from "./account.schema";
import { AccountService } from "./account.service";

const accountProcedure = authedProcedure.use(({ context, next }) => {
	const accountService = new AccountService(
		context.db,
		context.session.user.id
	);
	return next({
		context: { accountService },
	});
});

export const accountRouter = base.router({
	getSecuritySettings: accountProcedure
		.output(accountSchema.getSecuritySettings.output)
		.handler(async ({ context }) => {
			return await context.accountService.getSecuritySettings();
		}),

	setPassword: accountProcedure
		.input(accountSchema.setPassword.input)
		.output(accountSchema.setPassword.output)
		.handler(async ({ input, context }) => {
			return await context.accountService.setPassword(input);
		}),

	verifyPassword: accountProcedure
		.input(accountSchema.verifyPassword.input)
		.output(accountSchema.verifyPassword.output)
		.handler(async ({ input, context }) => {
			return await context.accountService.verifyPassword(input);
		}),
});
