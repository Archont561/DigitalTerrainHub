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

const toWidth = (value: any) => _.isNumber(value) ? `${value}px` : value;
const getBreakpointSuffix = (bp: string) => bp === "base" ? "" : `-${bp}`;
const createAstroFlexVarName = (...parts: string[]) => createCSSVarName("astro", ...parts);

const propConverters: Record<string, PropConverter> = new Proxy({
    default: (value, propName) => ({}),
    direction: (value) => {
        let flexDirValue = value;
        if (_.startsWith("col", value)) flexDirValue = flexDirValue.replace("col", "column");
        return { [createAstroFlexVarName("flex", "direction")]: flexDirValue }
    },
    gap: (value) => ({
        [createAstroFlexVarName('flex', 'gap')]: _.isNumber(value) ? `calc(var(--spacing)*${value})` : value,
    }),
    base: (value) => ({
        [createAstroFlexVarName('basis')]: toWidth(value),
    }),
    grow: (value) => ({
        [createAstroFlexVarName('grow')]: toWidth(value),
    }),
    shrink: (value) => ({
        [createAstroFlexVarName('shrink')]: toWidth(value),
    }),
    multilinePlacement: (value) => ({
        // @ts-ignore
        [createAstroFlexVarName('align', 'content')]: FlexMultilinePlacementMap[value],
    }),
    placement: (value, propType) => {
        const vars = {} as Record<string, string>;
        if (propType === "") {
            // @ts-ignore
            const [justify, align] = FlexPlacementMap[value];
            _.assign(vars, {
                [createAstroFlexVarName('justify', 'content')]: justify,
                [createAstroFlexVarName('align', 'items')]: align,
            });
        } else if (propType === "item") {
            _.assign(vars, {
                // @ts-ignore
                [createAstroFlexVarName('align', 'self')]: FlexItemPlacementMap[value],
            });
        }
        return vars;
    },
}, {
    get(target, prop: string): PropConverter {
        //@ts-ignore
        return (prop in target) ? target[prop] : target.default;
    },
});

type GetFlexCSSVariablesOptions = {
    props: FlexProps | FlexItemProps;
    propType?: string;
    asInlineStyle?: boolean;
};

export function getFlexCSSVariables({
    props, 
    propType = "",
    asInlineStyle = false,
}: GetFlexCSSVariablesOptions): Record<string, string> | string {
    const variables: Record<string, string> = {};

    _.forEach(props, (value, propName) => {
        if (!value) return;

        const isResponsive = _.isPlainObject(value) && !Array.isArray(value);
        const breakpoints = isResponsive ? value : { base: value };

        _.forEach(breakpoints as any, (bpValue, breakpoint) => {
            const propConverter = propConverters[propName];
            const flexCSSVariables = propConverter(bpValue, propType);;
            _.assign(variables, _.mapKeys(flexCSSVariables,
                (_val, key) => `${key}${getBreakpointSuffix(breakpoint)}`));
        });
    });

    return asInlineStyle ? _.map(variables, (value, key) => `${key}: ${value};`).join("") : variables;
}