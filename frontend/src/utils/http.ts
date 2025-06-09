export function buildPathname(...segments: (string | number | null | undefined)[]): string {
    return '/' + segments
        .filter(Boolean)
        .map(s => s!.toString().trim().replace(/^\/+|\/+$/g, ''))
        .join('/');
}

export function getURLWithBase(url: string): string {
    return buildPathname(import.meta.env.BASE_URL, url);
}

export function resolveURL(strings: TemplateStringsArray, ...expressions: any[]) {
    const result = [strings[0]];
    expressions.forEach((expr, i) => {
        result.push(expr + strings[i + 1]);
    });
    return buildPathname(...result);
}

export function resolveURLWithBase(strings: TemplateStringsArray, ...expressions: any[]) {
    return buildPathname(import.meta.env.BASE_URL, resolveURL(strings, ...expressions));
}