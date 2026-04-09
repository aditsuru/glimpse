import { type NextRequest, NextResponse } from "next/server";

function extractMeta(html: string, property: string): string | null {
	const patterns = [
		new RegExp(
			`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
			"i"
		),
		new RegExp(
			`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
			"i"
		),
	];
	for (const p of patterns) {
		const m = html.match(p);
		if (m?.[1]) return m[1];
	}
	return null;
}

// SSRF guard — block private/internal addresses
function isPrivateUrl(urlStr: string): boolean {
	try {
		const { hostname, protocol } = new URL(urlStr);
		if (protocol !== "https:" && protocol !== "http:") return true;
		if (
			/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|::1|fd[0-9a-f]{2}:)/i.test(
				hostname
			)
		)
			return true;
		if (
			hostname === "169.254.169.254" ||
			hostname === "metadata.google.internal"
		)
			return true;
		return false;
	} catch {
		return true;
	}
}

// ─────────────────────────────────────────────
// FIX: YouTube / large-site 2 MB cache error
//
// The original code used `next: { revalidate: 3600 }` on the fetch, which
// tells Next.js to cache the full response body. YouTube pages are ~3 MB of
// HTML, exceeding the 2 MB limit and producing:
//   "Failed to set Next.js data cache … items over 2MB can not be cached"
//
// All we actually need are the <head> meta tags — the first ~100 KB is more
// than enough. So we read the response body in streaming chunks and stop as
// soon as we have enough bytes. The `next` cache directive is removed; SWR
// on the client (dedupingInterval: 60_000) is sufficient to prevent duplicate
// calls.
// ─────────────────────────────────────────────
const MAX_READ_BYTES = 100_000; // 100 KB — plenty for <head> meta tags

async function readPartialBody(res: Response): Promise<string> {
	// Use the streaming reader so we can stop early and avoid buffering the
	// entire response in memory (important for 3 MB+ pages like YouTube).
	const reader = res.body?.getReader();
	if (!reader) return res.text(); // fallback for environments without streaming

	const decoder = new TextDecoder();
	let result = "";
	let bytesRead = 0;

	try {
		while (bytesRead < MAX_READ_BYTES) {
			const { done, value } = await reader.read();
			if (done) break;
			result += decoder.decode(value, { stream: true });
			bytesRead += value.length;
		}
	} finally {
		// Always cancel the reader to release the network connection.
		reader.cancel().catch(() => {});
	}

	return result;
}

export async function GET(req: NextRequest) {
	const url = req.nextUrl.searchParams.get("url");

	if (!url) {
		return NextResponse.json({ error: "Missing url" }, { status: 400 });
	}

	try {
		new URL(url);
		if (isPrivateUrl(url)) {
			return NextResponse.json({ error: "Invalid url" }, { status: 400 });
		}
	} catch {
		return NextResponse.json({ error: "Invalid url" }, { status: 400 });
	}

	try {
		const res = await fetch(url, {
			headers: { "User-Agent": "Twitterbot/1.0" },
			// NOTE: `next: { revalidate: 3600 }` removed — it tried to cache the
			// full response body, which fails for pages > 2 MB (YouTube, etc.).
			// Client-side SWR deduplication (dedupingInterval: 60_000) is enough.
		});

		if (!res.ok) {
			return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
		}

		// Read only the first 100 KB — all meta tags live in <head> which
		// appears in the first few KB of any well-formed HTML page.
		const html = await readPartialBody(res);
		const hostname = new URL(url).hostname;

		const title =
			extractMeta(html, "og:title") ??
			extractMeta(html, "twitter:title") ??
			html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ??
			null;

		const description =
			extractMeta(html, "og:description") ??
			extractMeta(html, "twitter:description") ??
			extractMeta(html, "description") ??
			null;

		const image =
			extractMeta(html, "og:image") ??
			extractMeta(html, "twitter:image") ??
			null;

		const siteName = extractMeta(html, "og:site_name") ?? hostname;

		return NextResponse.json(
			{ title, description, image, siteName, url },
			{
				headers: {
					// Cache at the CDN / browser level for 1 hour so repeated page
					// loads don't hit the route handler every time.
					"Cache-Control":
						"public, s-maxage=3600, stale-while-revalidate=86400",
				},
			}
		);
	} catch {
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}
