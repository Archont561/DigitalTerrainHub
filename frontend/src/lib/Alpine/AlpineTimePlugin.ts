import type { Alpine } from 'alpinejs';
import { getRelativeTimeBetweenDates } from "@utils";

declare module "alpinejs" {
    interface Magics<T> {
        $relativeTime: typeof getRelativeTimeBetweenDates;
    }
}

export default function timePlugin(Alpine: Alpine) {
    Alpine.magic("relativeTime", () => getRelativeTimeBetweenDates);

    Alpine.directive("interval", (el, { modifiers, expression }, { evaluate, cleanup }) => {
        if (modifiers.length !== 1) throw new Error("Directive 'x-interval' should have interval duration defined as modifier");

        const intervalID = setInterval(evaluate, parseInt(modifiers[0]), expression);
        cleanup(() => {
            clearInterval(intervalID);
        });
    });
}