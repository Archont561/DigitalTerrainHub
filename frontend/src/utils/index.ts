export function buildPathname(...segments: (string | number | null | undefined)[]): string {
    return '/' + segments
        .filter(Boolean)
        .map(s => s!.toString().trim().replace(/^\/+|\/+$/g, ''))
        .join('/');
}

export function getUrlWithBase(url: string): string {
    return buildPathname(import.meta.env.BASE_URL, url);
}
