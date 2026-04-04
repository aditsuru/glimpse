import Mention from "@tiptap/extension-mention";
import StarterKit from "@tiptap/starter-kit";

export const renderExtensions = [
	StarterKit,
	Mention.configure({
		renderHTML({ node }) {
			return [
				"a",
				{ href: `/u/${node.attrs.id}`, class: "mention" },
				`@${node.attrs.label}`,
			];
		},
	}),
];
