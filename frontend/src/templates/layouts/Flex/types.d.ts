import type { FlexPlacementMap, FlexMultilinePlacementMap, FlexItemPlacementMap } from "./flexPropMaps";

export type PropConverter = (value: any, propName?: string) => Record<string, string>;
export type PropConverterMap = Record<string, PropConverter>;

export type Breakpoints = 'base' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ResponsiveProp<T> = T | Partial<Record<Breakpoints, T>>;

export type FlexPlacementMapKeys = keyof typeof FlexPlacementMap;
export type FlexDirection = "row" | "col" | "row-reverse" | "col-reverse";
type FlexMultilinePlacementMapKeys = keyof typeof FlexMultilinePlacementMap
export type FlexMultilinePlacement = FlexMultilinePlacementMapKeys | `${FlexMultilinePlacementMapKeys}-wrap-reverse`;

export interface CSSVariable {
    cssVariableName: string;
    value: string;
    breakpoint: string;
  }

export interface FlexProps {
    inline?: boolean;
    gap?: ResponsiveProp<number | string>;
    placement?: ResponsiveProp<FlexPlacementMapKeys>;
    multilinePlacement?: ResponsiveProp<FlexMultilinePlacement>;
    direction?: ResponsiveProp<FlexDirection>;
    wrap?: "normal" | "reverse";
}

export interface FlexItemProps {
    order?: number;
    grow?: ResponsiveProp<number>;
    shrink?: ResponsiveProp<number>;
    base?: ResponsiveProp<number>;
    placement?: ResponsiveProp<keyof typeof FlexItemPlacementMap>;
}