/** biome-ignore-all lint/suspicious/noExplicitAny: dev page */
"use client";

import { useCallback, useState } from "react";
import { RichEditor } from "@/primitives/editor/RichEditor";
import { RichRenderer } from "@/primitives/editor/RichRenderer";
import type { MentionUser } from "@/primitives/editor/types";

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const MOCK_USERS: MentionUser[] = [
	{
		id: "user-1",
		username: "aditsuru",
		displayName: "Adi",
		// FIX: was "avatarUrL" (capital L) — the correct key is "avatarUrl"
		avatarUrl: "/static/default-pfp.png",
	},
	{
		id: "user-2",
		username: "janedoe",
		displayName: "Jane Doe",
		avatarUrl: undefined,
	},
	{
		id: "user-3",
		username: "johnsmith",
		displayName: "John Smith",
		avatarUrl: undefined,
	},
];

// ─────────────────────────────────────────────
// Mock API functions
//
// Q: "Won't typing on every keystroke trigger a backend API call?"
//
// A (editor content): No. `onUpdate` fires on every keystroke but it only
//   updates local React state — no network call is made for the editor content
//   itself. You only send to a backend when the user explicitly submits.
//
// A (mention suggestions): YES — the old code called `fetchMentionUsers`
//   on every character typed in the @mention query. This is now fixed with
//   a 300 ms debounce in mention-suggestion.ts. The real fetchMentionUsers
//   below is only called after the user pauses typing.
// ─────────────────────────────────────────────

/**
 * Mock mention search — simulates a server query with a small delay.
 * In production replace with: fetch(`/api/users?q=${query}`).then(r => r.json())
 *
 * Wrapped in useCallback at the call site so the reference stays stable
 * across renders (prevents unnecessary re-creation of TipTap extensions).
 */
async function mockFetchMentionUsers(query: string): Promise<MentionUser[]> {
	// Simulate network latency
	await new Promise((r) => setTimeout(r, 200));
	const q = query.toLowerCase();
	return MOCK_USERS.filter(
		(u) =>
			u.username.toLowerCase().includes(q) ||
			u.displayName.toLowerCase().includes(q)
	);
}

/**
 * Mock single-user fetch — used by MentionHoverCard when the user hovers
 * over a @mention chip in RichRenderer.
 * In production replace with: fetch(`/api/users/${id}`).then(r => r.json())
 */
async function mockFetchMentionUser(id: string): Promise<MentionUser | null> {
	await new Promise((r) => setTimeout(r, 150));
	return MOCK_USERS.find((u) => u.id === id) ?? null;
}

// ─────────────────────────────────────────────
// Dev page
// ─────────────────────────────────────────────

function Dev() {
	const [editorJson, setEditorJson] = useState<any>(null);

	const handleUpdate = useCallback(
		(output: { json: any; html: string; text: string }) => {
			setEditorJson(output.json);
		},
		[]
	);

	// Keep fetchMentionUsers stable so TipTap extensions aren't rebuilt on every render.
	const fetchMentionUsers = useCallback(mockFetchMentionUsers, []);

	return (
		<div className="w-screen h-screen flex justify-center gap-4 py-4 px-4">
			<div className="w-full max-w-lg">
				<RichEditor
					fetchMentionUsers={fetchMentionUsers}
					onUpdate={handleUpdate}
					placeholder="Write something… type @ to mention someone"
				/>
			</div>

			{editorJson && (
				<div className="w-full max-w-lg border rounded-lg p-4 bg-card">
					<p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
						Rendered output
					</p>
					<RichRenderer
						content={editorJson}
						fetchMentionUser={mockFetchMentionUser}
					/>
				</div>
			)}
		</div>
	);
}

export default Dev;
