function isStylesheetLoaded(href) {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .some(link => link.href === href);
  }


function loadStylesheet(href) {
    if (isStylesheetLoaded(href)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => console.log(`Stylesheet loaded: ${href}`);
    link.onerror = () => console.error(`Failed to load stylesheet: ${href}`);
  
    document.head.appendChild(link);
}

export { loadStylesheet } 