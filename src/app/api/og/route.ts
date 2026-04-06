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

export async function GET(req: NextRequest) {
	const url = req.nextUrl.searchParams.get("url");

	if (!url) {
		return NextResponse.json({ error: "Missing url" }, { status: 400 });
	}

	try {
		new URL(url); // throws if invalid
	} catch {
		return NextResponse.json({ error: "Invalid url" }, { status: 400 });
	}

	try {
		const res = await fetch(url, {
			headers: { "User-Agent": "Twitterbot/1.0" }, // many sites gate OG on UA
			next: { revalidate: 3600 },
		});

		if (!res.ok) {
			return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
		}

		const html = await res.text();
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

		return NextResponse.json({ title, description, image, siteName, url });
	} catch {
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}
