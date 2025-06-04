function isStylesheetLoaded(href: string, element: Element | ShadowRoot) {
    const links: HTMLLinkElement[] = Array.from(element.querySelectorAll('link[rel="stylesheet"]'));
    return links.some(link => link.href === href);
  }


export function loadStylesheet(href: string, element?: Element | ShadowRoot) {
    const node = element || document.head; 
    if (isStylesheetLoaded(href, node)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => console.log(`Stylesheet loaded: ${href}`);
    link.onerror = () => console.error(`Failed to load stylesheet: ${href}`);
  
    node.appendChild(link);
}