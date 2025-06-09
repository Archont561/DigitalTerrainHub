export * from "./http";

export function kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export const toTitleCase = (str: string) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
