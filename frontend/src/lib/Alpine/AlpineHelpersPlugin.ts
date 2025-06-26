import type { Alpine } from "alpinejs";
import { getRelativeTimeBetweenDates } from "@utils";

declare module "alpinejs" {
    interface Magics<T> {
        $find: (query: string) => Element | null;
        $closest: (query: string) => Element | null;
        $relativeTime: typeof getRelativeTimeBetweenDates;
    }
}


export default function (Alpine: Alpine) {
    Alpine.magic("find", () => (query: string) => document.querySelector(query));
    Alpine.magic("closest", el => (query: string) => el.closest(query));
    Alpine.magic("relativeTime", () => getRelativeTimeBetweenDates);

    Alpine.directive("interval", (el, { modifiers, expression }, { evaluate, cleanup }) => {
        if (modifiers.length !== 1) throw new Error("Directive 'x-interval' should have interval duration defined as modifier");

        const intervalID = setInterval(evaluate, parseInt(modifiers[0]), expression);
        cleanup(() => {
            clearInterval(intervalID);
        });
    })
}