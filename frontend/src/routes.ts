import { fileURLToPath, pathToFileURL } from "url";
import { join, dirname, resolve } from "path";
import _ from "lodash";

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)));
const pagesDir = join(srcDir, "templates", "pages");

function getPage(name: string) {
    return join(pagesDir, `${name}.astro`);
}

const prodRoutes = {
    "/": getPage("Home"),
    "/login": getPage("Login"),
    "/register": getPage("Register"),
    "/profile": getPage("Profile"),
    "/api/[...path]": join(srcDir, "api", "index.ts"),
    "/[...path]": getPage("404"),
};

const devRoutes = {
    "/dev": join(srcDir, "dev", "index.astro"),
};

export function getRoutes() {
    const routes = !import.meta.env.DEV ? prodRoutes : { ...prodRoutes, ...devRoutes };
    return _.mapValues(routes, route => pathToFileURL(route).href);
}