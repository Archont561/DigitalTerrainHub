import type { Alpine } from "alpinejs";

export default function (Alpine: Alpine) {
    Alpine.magic("all", el => (...expresions: any[]) => {
        expresions.forEach(expr => {
            if (typeof expr === "string") Alpine.evaluate(el, expr);
            else if (typeof expr === "function") expr();
        })
    });
    Alpine.magic("setAttr", el => (attrName: string, value: any) => {
        //@ts-ignore
        Alpine.$data(el)[attrName] = value;
    });
}