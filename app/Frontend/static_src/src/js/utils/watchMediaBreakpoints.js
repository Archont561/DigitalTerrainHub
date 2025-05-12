export async function watchBreakpoints(breakpoints) {
    Object.entries(breakpoints).forEach(([breakpoint, breakpointWidth], index, entries) => {
        const mediaQuery = window.matchMedia(`(width >= ${breakpointWidth})`);
        const dispatchEvent = (queryMatches) => {
            const eventName = queryMatches ? breakpoint : `not-${breakpoint}`;
            window.dispatchEvent(new CustomEvent(eventName));
        };
        mediaQuery.addEventListener("change", (event) => dispatchEvent(event.matches));
        dispatchEvent(mediaQuery.matches);
    });
}
