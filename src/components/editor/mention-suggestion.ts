import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { MentionUser } from "@/primitives/editor/types";
import MentionList, { type MentionListHandle } from "./MentionList";

// ─────────────────────────────────────────────
// buildMentionSuggestion
// ─────────────────────────────────────────────

export function buildMentionSuggestion(
	fetchUsers: (query: string) => Promise<MentionUser[]>
): Omit<SuggestionOptions, "editor"> {
	return {
		char: "@",

		// Return empty array for empty queries to avoid noisy network calls
		items: async ({ query }): Promise<MentionUser[]> => {
			if (query.trim().length === 0) return [];
			return fetchUsers(query);
		},

		render: () => {
			let renderer: ReactRenderer<
				MentionListHandle,
				React.ComponentProps<typeof MentionList>
			>;
			let container: HTMLDivElement;

			return {
				onStart(props) {
					container = document.createElement("div");
					container.style.cssText =
						"position:absolute;z-index:50;pointer-events:none;";
					document.body.appendChild(container);

					renderer = new ReactRenderer(MentionList, {
						props,
						editor: props.editor,
					});

					// pointer-events back on the actual content
					(renderer.element as HTMLElement).style.pointerEvents = "auto";
					container.appendChild(renderer.element);

					void positionDropdown(props.clientRect, container);
				},

				onUpdate(props) {
					renderer.updateProps(props);
					void positionDropdown(props.clientRect, container);
				},

				onKeyDown(props): boolean {
					if (props.event.key === "Escape") {
						container.style.display = "none";
						return true;
					}
					return renderer.ref?.onKeyDown(props) ?? false;
				},

				onExit() {
					renderer.destroy();
					container.remove();
				},
			};
		},
	};
}

// ─────────────────────────────────────────────
// positionDropdown — floating-ui positioning
// ─────────────────────────────────────────────

async function positionDropdown(
	clientRectFn: (() => DOMRect | null) | null | undefined,
	container: HTMLElement
): Promise<void> {
	const rect = clientRectFn?.();
	if (!rect) return;

	const virtualEl = {
		getBoundingClientRect: () => rect,
	} as Element;

	const { x, y } = await computePosition(virtualEl, container, {
		placement: "bottom-start",
		middleware: [offset(8), flip(), shift({ padding: 8 })],
	});

	container.style.left = `${x}px`;
	container.style.top = `${y}px`;
}
