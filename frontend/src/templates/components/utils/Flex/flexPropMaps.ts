export const FlexPlacementMap = {
    'start start': ['flex-start', 'flex-start'],
    'start end': ['flex-start', 'flex-end'],
    'start center': ['flex-start', 'center'],
    'start stretch': ['flex-start', 'stretch'],
    'start baseline': ['flex-start', 'baseline'],

    'end start': ['flex-end', 'flex-start'],
    'end end': ['flex-end', 'flex-end'],
    'end center': ['flex-end', 'center'],
    'end stretch': ['flex-end', 'stretch'],
    'end baseline': ['flex-end', 'baseline'],

    'center start': ['center', 'flex-start'],
    'center end': ['center', 'flex-end'],
    'center center': ['center', 'center'],
    'center stretch': ['center', 'stretch'],
    'center baseline': ['center', 'baseline'],

    'between start': ['space-between', 'flex-start'],
    'between end': ['space-between', 'flex-end'],
    'between center': ['space-between', 'center'],
    'between stretch': ['space-between', 'stretch'],
    'between baseline': ['space-between', 'baseline'],

    'around start': ['space-around', 'flex-start'],
    'around end': ['space-around', 'flex-end'],
    'around center': ['space-around', 'center'],
    'around stretch': ['space-around', 'stretch'],
    'around baseline': ['space-around', 'baseline'],

    'evenly start': ['space-evenly', 'flex-start'],
    'evenly end': ['space-evenly', 'flex-end'],
    'evenly center': ['space-evenly', 'center'],
    'evenly stretch': ['space-evenly', 'stretch'],
    'evenly baseline': ['space-evenly', 'baseline'],
} as const;

export const FlexMultilinePlacementMap = {
    full: 'stretch',
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
    'writing-start': 'start',
    'writing-end': 'end',
} as const;

export const FlexItemPlacementMap = {
    start: "flex-start",
    end: "flex-start",
    "end-safe": "flex-end",
    "center-safe": "safe flex-end",
    center: "center",
    full: "stretch",
    baseline: "baseline",
    "baseline-last": "last baseline",
} as const;