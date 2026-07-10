// scripts/check-metadata.ts
// Run with: bun run scripts/check-metadata.ts
// Requires: dev server running on localhost:3000

interface RouteCheck {
	path: string;
	expectedTitleIncludes: string;
	expectNoindex: boolean;
	requiresAuth?: boolean; // skip strict checks, just confirm it doesn't crash
}

const routes: RouteCheck[] = [
	// Tier 1 — public, indexable
	{ path: "/sign-in", expectedTitleIncludes: "Sign In", expectNoindex: false },
	{ path: "/sign-up", expectedTitleIncludes: "Sign Up", expectNoindex: false },
	{
		path: "/legal/tos",
		expectedTitleIncludes: "Terms of Service",
		expectNoindex: false,
	},
	{
		path: "/legal/privacy",
		expectedTitleIncludes: "Privacy Policy",
		expectNoindex: false,
	},
	{
		path: "/legal/guidelines",
		expectedTitleIncludes: "Community Guidelines",
		expectNoindex: false,
	},

	// Tier 2 — noindex, behind auth (will redirect if not logged in, that's fine, we just check the response doesn't 500)
	{
		path: "/following",
		expectedTitleIncludes: "Following",
		expectNoindex: true,
		requiresAuth: true,
	},
	{
		path: "/bookmarks",
		expectedTitleIncludes: "Bookmarks",
		expectNoindex: true,
		requiresAuth: true,
	},
	{
		path: "/notifications",
		expectedTitleIncludes: "Notifications",
		expectNoindex: true,
		requiresAuth: true,
	},
	{
		path: "/settings",
		expectedTitleIncludes: "Settings",
		expectNoindex: true,
		requiresAuth: true,
	},
	{
		path: "/forgot-password",
		expectedTitleIncludes: "Forgot Password",
		expectNoindex: true,
	},
	{
		path: "/reset-password",
		expectedTitleIncludes: "Reset Password",
		expectNoindex: true,
	},

	// Tier 3 — admin/dev
	{
		path: "/admin/reports",
		expectedTitleIncludes: "Admin",
		expectNoindex: true,
		requiresAuth: true,
	},
	{ path: "/dev", expectedTitleIncludes: "Dev Preview", expectNoindex: true },
];

const BASE_URL = "http://localhost:3000";

async function checkRoute(route: RouteCheck) {
	try {
		const res = await fetch(`${BASE_URL}${route.path}`, { redirect: "manual" });

		// A redirect (307/302) on an auth-gated route is expected — not a failure
		if (route.requiresAuth && (res.status === 307 || res.status === 302)) {
			return {
				...route,
				status: "SKIPPED (redirected, requires auth)",
				pass: true,
			};
		}

		if (res.status >= 500) {
			return { ...route, status: `FAIL (${res.status})`, pass: false };
		}

		const html = await res.text();

		const titleMatch = html.match(/<title>(.*?)<\/title>/i);
		const title = titleMatch?.[1] ?? "";

		const robotsMatch = html.match(
			/<meta\s+name="robots"\s+content="([^"]*)"/i
		);
		const robotsContent = robotsMatch?.[1] ?? "";
		const isNoindex = robotsContent.includes("noindex");

		const titleOk = title.includes(route.expectedTitleIncludes);
		const robotsOk = isNoindex === route.expectNoindex;

		return {
			...route,
			status: `title="${title}" robots="${robotsContent || "(default)"}"`,
			pass: titleOk && robotsOk,
		};
	} catch (e) {
		return { ...route, status: `ERROR: ${e}`, pass: false };
	}
}

async function main() {
	console.log(`Checking ${routes.length} routes against ${BASE_URL}...\n`);

	const results = await Promise.all(routes.map(checkRoute));

	for (const r of results) {
		const icon = r.pass ? "✅" : "❌";
		console.log(`${icon} ${r.path.padEnd(25)} ${r.status}`);
	}

	const failed = results.filter((r) => !r.pass);
	console.log(`\n${results.length - failed.length}/${results.length} passed.`);

	if (failed.length > 0) {
		console.log("\nFailed routes:");
		failed.forEach((f) => {
			console.log(`  - ${f.path}: ${f.status}`);
		});
		process.exit(1);
	}
}

main();
