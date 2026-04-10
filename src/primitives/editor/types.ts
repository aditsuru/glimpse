export interface MentionUser {
	id: string;
	username: string;
	displayName: string;
	avatarUrl?: string;
}

export interface EditorOutput {
	json: object;
	html: string;
	text: string;
}

export interface RichEditorProps {
	initialContent?: object;
	placeholder?: string;
	maxChars?: number;
	onUpdate?: (content: EditorOutput) => void;
	fetchMentionUsers: (query: string) => Promise<MentionUser[]>;
	readOnly?: boolean;
}

export interface RichRendererProps {
	content: object;
	fetchMentionUser?: (id: string) => Promise<MentionUser | null>;
	readMore?: boolean | number;
}

export interface MentionHoverCardProps {
	id: string;
	label: string;
	fetchUser?: (id: string) => Promise<MentionUser | null>;
}
