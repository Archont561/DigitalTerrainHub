export function replaceElement(el: Element, htmlString: string) {
    const range = document.createRange();
    const fragment = range.createContextualFragment(htmlString.trim());
    const newEl = fragment.firstElementChild;
    if (!newEl) {
        throw new Error("HTML string did not produce a valid element");
    }
    el.parentNode?.replaceChild(newEl, el);
    return el;
}

export function replaceElementContent(el: Element, htmlString: string) {
    while (el.firstChild) el.removeChild(el.firstChild);
    const range = document.createRange();
    const fragment = range.createContextualFragment(htmlString.trim());
    el.appendChild(fragment);
    return el;
}

