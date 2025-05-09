const themes = {
    light: "bumblebee",
    dark: "night",
}

function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
}

async function init() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? themes.dark : themes.light);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        applyTheme(e.matches ? themes.dark : themes.light);
    });
}

export default {
    init
}