import type {
    FlexProps,
    FlexItemProps,
    PropConverterMap,
    CSSVariable,
} from "./types";
import {
    FlexItemPlacementMap,
    FlexPlacementMap,
    FlexMultilinePlacementMap,
} from "./flexPropMaps";
import _ from "lodash";
import { createCSSVarName, mergeClass, mergeStyle } from "@utils";

const toWidth = (value: any) => _.isNumber(value) ? `${value}px` : value;
const createAstroFlexVarName = (...parts: string[]) => createCSSVarName("astro", ...parts);

const propConverters: PropConverterMap = new Proxy({
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
    get(target, prop: string) {
        //@ts-ignore
        return (prop in target) ? target[prop] : target.default;
    },
});

const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export function getFlexCSSVariables(
    props: FlexProps | FlexItemProps
): { baseVariables: Record<string, string>; mediaVariables: CSSVariable[] } {
    const baseVariables: Record<string, string> = {};
    const mediaVariables: CSSVariable[] = [];

    _.forEach(props, (value, propName) => {
        if (value == null) return;

        // Determine if responsive (object with breakpoints)
        const isResponsive = _.isPlainObject(value) && !Array.isArray(value);
        const breakpoints = isResponsive ? value : { base: value };

        _.forEach(breakpoints as {}, (bpValue, breakpoint) => {
            const propConverter = propConverters[propName];
            const gridCSSVariables = propConverter(bpValue, propName);

            _.forEach(gridCSSVariables, (val, varName) => {
                if (breakpoint === "base") {
                    baseVariables[varName] = val;
                } else {
                    mediaVariables.push({
                        cssVariableName: varName,
                        value: val,
                        breakpoint,
                    });
                }
            });
        });
    });

    mediaVariables.sort((a, b) => {
        return breakpointOrder.indexOf(a.breakpoint) - breakpointOrder.indexOf(b.breakpoint);
    });

    return { baseVariables, mediaVariables };
}

export function getAlpineMediaPluginAttributes(
    { baseVariables, mediaVariables }
    : { baseVariables: Record<string, string>; mediaVariables: CSSVariable[] }
) {
    const alpineAttrs: Record<string, string> = _.fromPairs(
        _.map(mediaVariables, ({ cssVariableName, value, breakpoint }, i, array) => {
            const previous = array[-1]?.value || baseVariables[cssVariableName];
            const key = `x-screen:${breakpoint}`;
            const setterExpression = `$cssProperty.set('${cssVariableName}', $mediaQuery.matches ? '${value}' : '${previous}')`;
            return [key, setterExpression];
        })
    );

    if (!_.isEmpty(alpineAttrs)) {
        alpineAttrs["x-init"] = "''";
    }

    return alpineAttrs;
}


export function getFlexStyles(style: string, baseVariables: Record<string, string>): string {
    return mergeStyle(
        style,
        _.fromPairs(
          _.map(baseVariables, (value, key) => {
            const newKey = key.replace(/^--astro-/, "--");
            return newKey !== key ? [newKey, `var(${key}, ${value})`] : [key, value];
          }),
        ),
      );
}