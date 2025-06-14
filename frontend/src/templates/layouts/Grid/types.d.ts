import type { GridContentPlacementMap, GridPlacementMap } from "./gridPropMaps";

export type Breakpoints = 'base' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GridUnit = 'auto' | `${number}px` | `${number}fr` | `${number}rem`;
export type GridColRowValue = number | GridUnit[] | string;
export type ResponsiveProp<T> = T | Partial<Record<Breakpoints, T>>;

export type GridPlacementMapKeys = keyof typeof GridPlacementMap;
export type GridContentPlacementMapKeys = keyof typeof GridContentPlacementMap;
export type NewGridCellPlacement = "row" | "column" | "row dense" | "column dense";
export type SubgridVariants = "both" | "row" | "col"; 

export interface GridProps {
  inline?: boolean;
  subgrid?: SubgridVariants;
  cellsPlacement?: ResponsiveProp<GridPlacementMapKeys>;
  contentPlacement?: ResponsiveProp<GridContentPlacementMapKeys>;
  cols?: ResponsiveProp<GridColRowValue>;
  rows?: ResponsiveProp<GridColRowValue>;
  gap?: ResponsiveProp<number | string>;
  newColSize?: GridUnit;
  newRowSize?: GridUnit;
  newCellAutoPlacement?: NewGridCellPlacement;
}

export interface GridCellProps {
  placement?: ResponsiveProp<GridPlacementMapKeys>;
  colSpan?: ResponsiveProp<number>;
  colStart?: ResponsiveProp<number>;
  colEnd?: ResponsiveProp<number>;
  rowStart?: ResponsiveProp<number>;
  rowSpan?: ResponsiveProp<number>;
  rowEnd?: ResponsiveProp<number>;
}