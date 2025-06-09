export const DaisyUILightThemes = [
    'light',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'valentine',
    'garden',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'cmyk',
    'lemonade',
    'winter',
    'sunset',
    'caramellatte',
    'silk',
] as const;

export const DaisyUIDarkThemes = [
    'dark',
    'synthwave',
    'retro',
    'cyberpunk',
    'halloween',
    'forest',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'autumn',
    'business',
    'acid',
    'night',
    'coffee',
    'dim',
    'nord',
    'abyss',
] as const;

export const DaisyUIThemes = [
    ...DaisyUIDarkThemes,
    ...DaisyUILightThemes,
] as const;

export type DaisyUIDarkTheme = typeof DaisyUIDarkThemes[number];
export type DaisyUILightTheme = typeof DaisyUILightThemes[number];
export type DaisyUITheme = DaisyUIDarkTheme | DaisyUILightTheme;