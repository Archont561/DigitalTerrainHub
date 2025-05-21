export function html(strings: TemplateStringsArray, ...expressions: any[]): HTMLElement {
    let result = strings[0];
    expressions.forEach((expr, i) => {
        result += expr + strings[i + 1];
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(result, 'text/html');

    return doc.body.firstElementChild as HTMLElement;
}

export default {
    html,
}