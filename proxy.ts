import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/post", "/profile", "/settings"];
const authRoutes = ["/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 1. Get the cookie
	const sessionCookie = getSessionCookie(request);

	// 2. Logic Checkers
	const isProtectedRoute =
		protectedRoutes.some((r) => pathname.startsWith(r)) || pathname === "/";
	const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

	// 3. Redirect Logic
	if (!sessionCookie && isProtectedRoute) {
		// Redirect to sign-in if no session found on protected route
		const url = new URL("/sign-in", request.url);
		// Optional: Add a callback URL so the user returns after login
		url.searchParams.set("callbackUrl", encodeURI(pathname));
		return NextResponse.redirect(url);
	}

	if (sessionCookie && isAuthRoute) {
		// If user is logged in, don't let them see sign-in/up pages
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	// Ensure this covers all routes except static files and your auth API
	matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
