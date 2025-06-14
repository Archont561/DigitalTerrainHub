import type {
    FlexProps,
    FlexItemProps,
} from "./types";
import {
    FlexItemPlacementMap,
    FlexPlacementMap,
    FlexMultilinePlacementMap,
} from "./flexPropMaps";
import _ from "lodash";
import { createCSSVarName } from "@utils";


type PropConverter = (value: any, propName?: string) => Record<string, string>;

const toWidth = (value: any) => typeof value === "number" ? `${value}px` : value;
const getBreakpointSuffix = (bp: string) => bp === "base" ? "" : `-${bp}`;

const propConverters: Record<string, PropConverter> = new Proxy({
    gap: (value) => ({
        [createCSSVarName('flex', 'gap')]: typeof value === "number" ? `calc(var(--spacing)*${value})` : value,
    }),
    base: (value) => ({
        [createCSSVarName('flex', 'item', 'base')]: toWidth(value),
    }),
    grow: (value) => ({
        [createCSSVarName('flex', 'item', 'grow')]: toWidth(value),
    }),
    shrink: (value) => ({
        [createCSSVarName('flex', 'item', 'shrink')]: toWidth(value),
    }),
    multilinePlacement: (value) => ({
        // @ts-ignore
        [createCSSVarName('flex', 'align', 'lines')]: FlexMultilinePlacementMap[value],
    }),
    placement: (value, propType) => {
        const vars = {} as Record<string, string>;
        if (propType === "") {
            // @ts-ignore
            const [justify, align] = FlexPlacementMap[value];
            _.assign(vars, {
                [createCSSVarName('flex', 'justify', 'line')]: justify,
                [createCSSVarName('flex', 'align', 'line')]: align,
            });
        } else if (propType === "item") {
            _.assign(vars, {
                // @ts-ignore
                [createCSSVarName('flex', 'item', 'placement')]: FlexItemPlacementMap[value],
            });
        }
        return vars;
    },
}, {
    get(target, prop: string): PropConverter {
        //@ts-ignore
        if (prop in target) return target[prop];
        return (value, propType = "") => ({
            [createCSSVarName("flex", propType, prop || "custom")]: String(value)
        });
    },
});


function getFlexCSSVariableVariants(propName: string, breakpoint: string, value: any, propType = ""): Record<string, string> {
    const propConverter = propConverters[propName];
    const variables = propConverter(value, propType);
    return _.mapKeys(variables, (_val, key) => `${key}${getBreakpointSuffix(breakpoint)}`);
}


export function getFlexCSSVariables(
    props: FlexProps | FlexItemProps,
    propType = ""
): Record<string, string> {
    const variables: Record<string, string> = {};

    _.forEach(props, (value, propName) => {
        if (!value) return;

        const isResponsive = _.isPlainObject(value) && !Array.isArray(value);
        const breakpoints = isResponsive ? value : { base: value };

        _.forEach(breakpoints as any, (breakpoint, bpValue) => {
            _.assign(variables, getFlexCSSVariableVariants(propName, breakpoint, bpValue, propType));
        });
    });

    return variables;
}


export function createStylesheetHTML(
    props: FlexProps | FlexItemProps,
    uuid: UUID,
    type = ""
): string {
    const cssVars = getFlexCSSVariables(props, type);

    const declarations = _.map(cssVars, (value, key) => `${key}: ${value};`).join("");

    return `<style>[${uuid}]{${declarations}}</style>`;
}