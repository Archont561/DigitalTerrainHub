import type { GridProps, GridCellProps } from "./types";
import { GridPlacementMap, GridContentPlacementMap } from "./gridPropMaps";
import _ from "lodash";
import { createCSSVarName } from "@utils";

type PropConverter = (value: any, propName?: string) => Record<string, string>;

const getBreakpointSuffix = (bp:  string) => bp === "base" ? "" : `-${bp}`;

const propConverters: Record<string, PropConverter> = new Proxy({
    gap: (value) => ({
        [createCSSVarName("grid", "gap")]: _.isNumber(value) ? `calc(var(--spacing)*${value})` : String(value),
    }),
    cols: (value) => ({
        [createCSSVarName("grid", "cols")]: Array.isArray(value)
            ? value.join(" ")
            : `repeat(${value}, minmax(0, 1fr))`,
    }),
    rows: (value) => ({
        [createCSSVarName("grid", "rows")]: Array.isArray(value)
            ? value.join(" ")
            : `repeat(${value}, minmax(0, 1fr))`,
    }),
    placement: (value) => ({
        // @ts-ignore
        [createCSSVarName("grid", "cell", "placement")]: GridPlacementMap[value],
    }),
    cellsPlacement: (value) => ({
        // @ts-ignore
        [createCSSVarName("grid", "cells", "placement")]: GridPlacementMap[value],
    }),
    contentPlacement: (value) => ({
        // @ts-ignore
        [createCSSVarName("grid", "content", "placement")]: GridContentPlacementMap[value],
    }),
}, {
    get(target, prop: string): PropConverter {
        //@ts-ignore
        if (prop in target) return target[prop];
        return (value, propType = "") => ({
            [createCSSVarName("grid", propType, prop || "custom")]: String(value),
        });
    },
});

function getGridCSSVariableVariants(propName: string, breakpoint: string, value: any, propType = ""): Record<string, string> {
    const propConverter = propConverters[propName];
    const variables = propConverter(value, propType);
    return _.mapKeys(variables, (_val, key) => `${key}${getBreakpointSuffix(breakpoint)}`);
}

export function getGridCSSVariables(
    props: GridProps | GridCellProps,
    propType = ""
): Record<string, string> {
    const variables: Record<string, string> = {};

    _.forEach(props, (value, propName) => {
        if (!value) return;

        const isResponsive = _.isPlainObject(value) && !Array.isArray(value);
        const breakpoints = isResponsive ? value : { base: value };

        _.forEach(breakpoints as any, (bpValue, breakpoint) => {
            _.assign(variables, getGridCSSVariableVariants(propName, breakpoint, bpValue, propType));
        });
    });

    return variables;
}


export function createStylesheetHTML(
    props: GridProps | GridCellProps,
    uuid: UUID,
    type = ""
): string {
    const cssVars = getGridCSSVariables(props, type);

    const declarations = _.map(cssVars, (value, key) => `${key}: ${value};`).join("");

    return `<style>[uuid='${uuid}']{${declarations}}</style>`;
}