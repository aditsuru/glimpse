import type { Level } from "@tiptap/extension-heading";

// ─── User / Mention ───────────────────────────────────────────────────────────

export interface MentionUser {
	id: string;
	username: string;
	displayName: string;
	avatarUrl?: string;
}

// ─── Editor output ────────────────────────────────────────────────────────────

/** Renamed from EditorContent to avoid shadowing TipTap's own EditorContent component */
export interface EditorOutput {
	json: object;
	html: string;
	text: string;
}

// ─── Component props ──────────────────────────────────────────────────────────

export interface RichEditorProps {
	initialContent?: object;
	placeholder?: string;
	onUpdate?: (content: EditorOutput) => void;
	fetchMentionUsers: (query: string) => Promise<MentionUser[]>;
	readOnly?: boolean;
}

export interface RichRendererProps {
	content: object;
	/**
	 * Optional async loader for a single mention user.
	 * Called lazily when the user hovers over a @mention chip.
	 */
	fetchMentionUser?: (id: string) => Promise<MentionUser | null>;
}

export interface MentionHoverCardProps {
	id: string;
	label: string;
	fetchUser?: (id: string) => Promise<MentionUser | null>;
}

export interface ToolbarProps {
	editor: import("@tiptap/react").Editor;
}

// Re-export for convenience
export type { Level };
