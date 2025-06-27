import type { Alpine } from "alpinejs";
import { makeClassCallable } from "@utils";

declare module "alpinejs" {
    interface Alpine {
        semanticsPlugin: AlpineSemanticsPlugin;
    }
}

type AlpineMagicCallback = Parameters<Alpine["magic"]>[1];

class AlpineSemanticsPlugin {
    private settings = {};

    getSettings() {
        return { ...this.settings };
    }

    install(Alpine: Alpine) {
        Alpine.magic("$setAttr", this.$setAttr);
        Alpine.magic("$all", this.$all);
        Alpine.semanticsPlugin = this;
    }

    private $all: AlpineMagicCallback = (el, { Alpine }) => (...expresions: any[]) => {
        expresions.forEach(expr => {
            if (typeof expr === "string") Alpine.evaluate(el, expr);
            else if (typeof expr === "function") expr();
        })
    }

    private $setAttr: AlpineMagicCallback = (el, { Alpine }) => (...expresions: any[]) => {
        expresions.forEach(expr => {
            if (typeof expr === "string") Alpine.evaluate(el, expr);
            else if (typeof expr === "function") expr();
        })
    }
    
}

export default new (makeClassCallable(AlpineSemanticsPlugin, "install"));