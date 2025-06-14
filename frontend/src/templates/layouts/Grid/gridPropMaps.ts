export const GridPlacementMap = {
    full: "stretch stretch",
    top: "start center",
    left: "center start",
    right: "center end",
    bottom: "end center",
    "vertical-center": "center stretch",
    "horizontal-center": "stretch center",
    "top-left": "start start",
    "top-center": "start center",
    "top-right": "start end",
    "center-left": "center start",
    center: "center center",
    "center-right": "center end",
    "bottom-left": "end start",
    "bottom-center": "end center",
    "bottom-right": "end end",
} as const;

export const GridContentPlacementMap = {
    full: "stretch stretch",
    
    top: "start stretch",
    "top-between": "start space-between",
    "top-around": "start space-around",
    "top-evenly": "start space-evenly",
    
    "center-horizontal": "stretch center",
    "center-horizontal-between": "space-between center",
    "center-horizontal-around": "space-around center",
    "center-horizontal-evenly": "space-evenly center",

    bottom: "end stretch",
    "bottom-between": "end space-between",
    "bottom-around": "end space-around",
    "bottom-evenly": "end space-evenly",

    left: "stretch start",
    "left-between": "space-between start",
    "left-around": "space-around start",
    "left-evenly": "space-evenly start",

    "center-vertical": "center stretch",
    "center-vertical-between": "center space-between",
    "center-vertical-around": "center space-around",
    "center-vertical-evenly": "center space-evenly",
    
    right: "stretch end",
    "right-between": "space-between end",
    "right-around": "space-around end",
    "right-evenly": "space-evenly end",
    
    "top-left": "start start",
    "top-center": "start center",
    "top-right": "start end",
    
    "center-left": "center start",
    center: "center center",
    "center-right": "center end",
    
    "bottom-left": "end start",
    "bottom-center": "end center",
    "bottom-right": "end end"
} as const;