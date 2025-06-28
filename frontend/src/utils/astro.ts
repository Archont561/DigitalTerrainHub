import _ from "lodash";
import clsx, { type ClassValue } from "clsx";

export function mergeClass(...args: ClassValue[]) {
    return clsx(...args);
}

type StyleValue = boolean | string | string[] | Record<string, string>;

export function mergeStyle(...args: StyleValue[]) {
    const styles: string[] = [];
    _.forEach(args, arg => {
        if (_.isString(arg)) arg && styles.push(arg);
        else if (_.isArray(arg)) styles.push(...arg.filter(Boolean));
        else if (_.isObject(arg)) styles.push(_.map(
            _.pickBy(arg, Boolean), 
            (value, key) => `${key}:${value};`
        ).join(""));
    });
    return styles.join("");
}

