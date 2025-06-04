export interface Utils {
    html(strings: TemplateStringsArray, ...expressions: any[]): HTMLElement;
    watchBreakpoints(breakpoints: Record<string, string>): void;
    loadStylesheet(href: string, element?: Element | ShadowRoot);
}