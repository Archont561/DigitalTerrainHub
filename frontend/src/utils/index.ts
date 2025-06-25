import _ from "lodash";

export * from "./time";
export * from "./url";

export function createCSSVarName(...parts: string[]) {
    return `--${_.filter(parts, Boolean).map(part => _.kebabCase(part)).join("-")}`;
}

export function toTitleCase(str: string) {
    return _.startCase(_.toLower(str));
}
