import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { MentionUser } from "@/primitives/editor/types";
import MentionList, { type MentionListHandle } from "./MentionList";

// ─────────────────────────────────────────────
// Debounce helper
// ─────────────────────────────────────────────

/**
 * Returns a debounced version of `fn` that delays execution by `ms`.
 * The returned function returns a Promise that resolves with fn's result.
 *
 * WHY: The suggestion `items()` hook fires on every keystroke. Without
 * debouncing, every character typed triggers a network call to fetchUsers.
 * Debouncing at the factory level (not inside `items`) means the single
 * timer persists across successive `items()` calls — i.e. it resets
 * correctly as the user types.
 */
function makeDebouncedFetch(
	fn: (query: string) => Promise<MentionUser[]>,
	ms: number
) {
	let timer: ReturnType<typeof setTimeout>;

	return (query: string): Promise<MentionUser[]> =>
		new Promise((resolve) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				fn(query)
					.then(resolve)
					.catch(() => resolve([]));
			}, ms);
		});
}

// ─────────────────────────────────────────────
// buildMentionSuggestion
// ─────────────────────────────────────────────

export function buildMentionSuggestion(
	fetchUsers: (query: string) => Promise<MentionUser[]>
): Omit<SuggestionOptions, "editor"> {
	// Create the debounced fetcher once per factory call so the timer is shared
	// across all `items()` invocations within the same editor instance.
	const debouncedFetch = makeDebouncedFetch(fetchUsers, 300);

	return {
		char: "@",

		items: async ({ query }): Promise<MentionUser[]> => {
			if (query.trim().length === 0) return [];
			return debouncedFetch(query);
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
