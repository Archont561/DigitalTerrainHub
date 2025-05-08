const themes = {
    light: [
        "light",
    ],
    dark: [
        "dark"
    ],
}

function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
}

async function init() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? themes.dark[0] : themes.light[0]);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        applyTheme(e.matches ? themes.dark[0] : themes.light[0]);
    });
}

export default {
    init
}