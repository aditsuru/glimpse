import * as React from "react";

/**
 * Provides the scroll container element to VideoPlayer's IntersectionObserver.
 * Without this, IO uses the viewport as root — videos inside overflow containers
 * will autoplay/autopause at the wrong time.
 *
 * Usage: wrap every scrollable container with <ScrollContainer>.
 */
export const ScrollRootContext = React.createContext<HTMLElement | null>(null);
