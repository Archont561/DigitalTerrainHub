import type { Alpine } from "alpinejs";
import { getRelativeTimeBetweenDates } from "@utils";

declare module "alpinejs" {
    interface Magics<T> {
        $find: FindMagic;
        $relativeTime: typeof getRelativeTimeBetweenDates;
    }
}

type FindMagic = {
    <T extends Element = Element>(query: string): T | null;
    inside: <T extends Element = Element>(query: string) => T | null;
    closest: <T extends Element = Element>(query: string) => T | null;
    exists: (query: string) => boolean;
    count: (query: string) => number;
    text: (query: string) => string;
    attr: (query: string, attr: string) => string | null;
    all: {
        <T extends Element = Element>(query: string): NodeListOf<T>;
        inside: <T extends Element = Element>(query: string) => NodeListOf<T>;
    };
};

export default function (Alpine: Alpine) {
    Alpine.magic("find", el => {
        const find = ((query: string) => document.querySelector(query)) as FindMagic;

        find.inside = (query: string) => el.querySelector(query);
        find.closest = (query: string) => el.closest(query);

        const all = ((query: string) => document.querySelectorAll(query)) as FindMagic["all"];
        all.inside = (query: string) => el.querySelectorAll(query);
        find.all = all;

        find.exists = (query: string) => !!find(query);
        find.count = (query: string) => find.all(query).length;
        find.text = (query: string) => find(query)?.textContent ?? '';
        find.attr = (query: string, attr: string) => find(query)?.getAttribute(attr) ?? null;

        return find;
    });
    Alpine.magic("relativeTime", () => getRelativeTimeBetweenDates);

    Alpine.directive("interval", (el, { modifiers, expression }, { evaluate, cleanup }) => {
        if (modifiers.length !== 1) throw new Error("Directive 'x-interval' should have interval duration defined as modifier");

        const intervalID = setInterval(evaluate, parseInt(modifiers[0]), expression);
        cleanup(() => {
            clearInterval(intervalID);
        });
    })
}