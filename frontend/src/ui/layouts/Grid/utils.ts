import type { GridProps, GridCellProps, PropConverterMap, CSSVariable } from "./types";
import { GridPlacementMap, GridContentPlacementMap } from "./gridPropMaps";
import { createCSSVarName, mergeStyle } from "@utils";
import _ from "lodash";

const createAstroGridVarName = (...parts: string[]) => createCSSVarName("astro", ...parts);

const propConverters: PropConverterMap = new Proxy({
    default: (value, propName) => {
        const varName = {
            colStart: createAstroGridVarName("col", "start"),
            colSpan: createAstroGridVarName("col", "span"),
            colEnd: createAstroGridVarName("col", "end"),
            rowStart: createAstroGridVarName("row", "start"),
            rowSpan: createAstroGridVarName("row", "span"),
            rowEnd: createAstroGridVarName("row", "end"),
            newRowSize: createCSSVarName("auto", "rows"),
            newColSize: createCSSVarName("auto", "cols"),
            newCellAutoPlacement: createCSSVarName("grid", "flow"),
        }[propName || ""] || "";
        return { [varName]: String(value) };
    },
    gap: (value) => ({
        [createAstroGridVarName("grid", "gap")]: _.isNumber(value) ? `calc(var(--spacing)*${value})` : String(value),
    }),
    cols: (value) => ({
        [createAstroGridVarName("grid", "cols")]: _.isArray(value)
            ? value.join(" ")
            : `repeat(${value}, minmax(0, 1fr))`,
    }),
    rows: (value) => ({
        [createAstroGridVarName("grid", "rows")]: _.isArray(value)
            ? value.join(" ")
            : `repeat(${value}, minmax(0, 1fr))`,
    }),
    placement: (value) => ({
        // @ts-ignore
        [createAstroGridVarName("place", "self")]: GridPlacementMap[value],
    }),
    cellsPlacement: (value) => ({
        // @ts-ignore
        [createAstroGridVarName("place", "items")]: GridPlacementMap[value],
    }),
    contentPlacement: (value) => ({
        // @ts-ignore
        [createAstroGridVarName("place", "content")]: GridContentPlacementMap[value],
    }),
}, {
    get(target, prop: string) {
        //@ts-ignore
        return (prop in target) ? target[prop] : target.default;
    },
})

const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export function getGridCSSVariables(
    props: GridProps | GridCellProps
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

export function getGridStyles(style: string, baseVariables: Record<string, string>): string {
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