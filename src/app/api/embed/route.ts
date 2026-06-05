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

const MAX_READ_BYTES = 100_000;

async function readPartialBody(res: Response): Promise<string> {
	const reader = res.body?.getReader();
	if (!reader) return res.text();

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
		});

		if (!res.ok) {
			return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
		}

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
					"Cache-Control":
						"public, s-maxage=3600, stale-while-revalidate=86400",
				},
			}
		);
	} catch {
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}
