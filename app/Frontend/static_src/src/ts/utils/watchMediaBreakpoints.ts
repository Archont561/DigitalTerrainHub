export async function watchBreakpoints(breakpoints: Record<string, string>) {
    Object.entries(breakpoints).forEach(([breakpoint, breakpointWidth]) => {
        const mediaQuery = window.matchMedia(`(width >= ${breakpointWidth})`);
        const dispatchEvent = (queryMatches: boolean) => {
            const eventName = queryMatches ? breakpoint : `not-${breakpoint}`;
            window.dispatchEvent(new CustomEvent(eventName));
        };
        mediaQuery.addEventListener("change", (event) => dispatchEvent(event.matches));
        dispatchEvent(mediaQuery.matches);
    });
}
