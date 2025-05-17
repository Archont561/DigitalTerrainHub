function isStylesheetLoaded(href: string) {
    const links: HTMLLinkElement[] = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    return links.some(link => link.href === href);
  }


function loadStylesheet(href: string) {
    if (isStylesheetLoaded(href)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => console.log(`Stylesheet loaded: ${href}`);
    link.onerror = () => console.error(`Failed to load stylesheet: ${href}`);
  
    document.head.appendChild(link);
}

export { loadStylesheet } 