import type { GridProps, GridCellProps } from "./types";
import { GridPlacementMap, GridContentPlacementMap } from "./gridPositions";
import _ from "lodash";

function formatValue(propName: string, value: any): string {
    switch (propName) {
        case "rowStart":
        case "rowSpan":
        case "rowEnd":
        case "colStart":
        case "colSpan":
        case "colEnd":
        case 'newColSize':
        case 'newRowSize':
        case 'newCellAutoPlacement':
            return `${value}`;
        case "gap":
            return `calc(var(--spacing)*${value})`;
        case "placement":
        case "cellsPlacement":
            //@ts-ignore
            return GridPlacementMap[value];
        case "contentPlacement":
            //@ts-ignore
            return GridContentPlacementMap[value];
        case "cols":
        case "rows":
            if (Array.isArray(value)) return value.join(' ');
            return `repeat(${value}, minmax(0, 1fr))`;
        default:
            throw new Error(`Wrong property: ${propName}!`);
    }
}

function createGridCSSVariable(propName: string, breakpoint: string, value: any, propType = ""): Record<string, string> {
    const root = `grid${propType ? '-': ''}${_.kebabCase(propType)}`;
    const modifier = breakpoint === 'base' ? `` : `-${breakpoint}`;
    return { [`--${root}-${_.kebabCase(propName)}${modifier}`]: formatValue(propName, value) };
}

export function getGridCSSVariables(props: GridProps | GridCellProps, propType = ""): Record<string, string> {
    const variables: Record<string, string> = {};

    Object.entries(props).forEach(([propName, value]) => {
        if (!value) return;

        const isResponsive = typeof value === "object";

        if (!isResponsive) {
            Object.assign(
                variables, 
                createGridCSSVariable(propName, "base", value, propType));            
            return;
        }
        
        Object.entries(value).forEach(([breakpoint, bpValue]) => {
            Object.assign(
                variables, 
                createGridCSSVariable(propName, breakpoint, bpValue, propType));
        });
    });

    return variables;
}

export function createStylesheetHTML(props: GridProps | GridCellProps, uuid: UUID, propType = ""): string {
    const cssVars = getGridCSSVariables(props, propType);

    const declarations = Object.entries(cssVars)
        .map(([key, value]) => `${key}: ${value};`).join("");

    return `<style>[${uuid}]{${declarations}}</style>`;
}