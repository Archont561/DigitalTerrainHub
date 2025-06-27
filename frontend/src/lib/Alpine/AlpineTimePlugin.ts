import type { Alpine, DirectiveCallback } from 'alpinejs';
import { getRelativeTimeBetweenDates, makeClassCallable } from "@utils";

declare module "alpinejs" {
    interface Alpine {
        timePlugin: AlpineTimePlugin;
    }
    interface Magics<T> {
        $relativeTime: typeof getRelativeTimeBetweenDates;
    }
}

type AlpineMagicCallback = Parameters<Alpine["magic"]>[1];

class AlpineTimePlugin {
    private settings = {};

    getSettings() {
        return { ...this.settings };
    }

    install(Alpine: Alpine) {
        Alpine.magic("$relativeTime", this.$relativeTime);
        Alpine.directive("screen", this['x-interval']);
        Alpine.timePlugin = this;
    }

    private $relativeTime: AlpineMagicCallback = () => getRelativeTimeBetweenDates;

    private "x-interval": DirectiveCallback = (el, 
        { modifiers, expression }, 
        { evaluate, cleanup }
    ) => {
        if (modifiers.length !== 1) throw new Error("Directive 'x-interval' should have interval duration defined as modifier");

        const intervalID = setInterval(evaluate, parseInt(modifiers[0]), expression);
        cleanup(() => {
            clearInterval(intervalID);
        });
    }

}

export default new (makeClassCallable(AlpineTimePlugin, "install"));