import Mention from "@tiptap/extension-mention";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

// RENDER ONLY — do not import this into your editor setup.
// Your editor should have its own separate extensions array.
export const renderExtensions = [
	StarterKit,
	Link.configure({
		openOnClick: false,
		autolink: true,
		HTMLAttributes: {
			rel: "noopener noreferrer",
			target: "_blank",
		},
	}),
	Mention.configure({
		renderHTML({ node }) {
			return [
				"a",
				{ href: `/user/${node.attrs.label}`, class: "mention" },
				`@${node.attrs.label}`,
			];
		},
	}),
];
