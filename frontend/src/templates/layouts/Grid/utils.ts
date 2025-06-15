import type { GridProps, GridCellProps } from "./types";
import { GridPlacementMap, GridContentPlacementMap } from "./gridPropMaps";
import _ from "lodash";
import { createCSSVarName } from "@utils";

type PropConverter = (value: any, propName?: string) => Record<string, string>;

const getBreakpointSuffix = (bp: string) => bp === "base" ? "" : `-${bp}`;
const createAstroGridVarName = (...parts: string[]) => createCSSVarName("astro", ...parts);

const propConverters: Record<string, PropConverter> = new Proxy({
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
    get(target, prop: string): PropConverter {
        //@ts-ignore
        return (prop in target) ? target[prop] : target.default;
    },
})

type GetGridCSSVariablesOptions = {
    props: GridProps | GridCellProps;
    asInlineStyle?: boolean;
};

export function getGridCSSVariables({
    props, asInlineStyle = false
}: GetGridCSSVariablesOptions): Record<string, string> | string {
    const variables: Record<string, string> = {};

    _.forEach(props, (value, propName) => {
        if (!value) return;

        const isResponsive = _.isPlainObject(value) && !Array.isArray(value);
        const breakpoints = isResponsive ? value : { base: value };

        _.forEach(breakpoints as any, (bpValue, breakpoint) => {
            const propConverter = propConverters[propName];
            const gridCSSVariables = propConverter(bpValue, propName);;
            _.assign(variables, _.mapKeys(gridCSSVariables,
                (_val, key) => `${key}${getBreakpointSuffix(breakpoint)}`));
        });
    });

    return asInlineStyle ? _.map(variables, (value, key) => `${key}: ${value};`).join("") : variables;
}