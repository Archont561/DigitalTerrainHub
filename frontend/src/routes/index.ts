import { fileURLToPath, pathToFileURL } from "url";
import { join, dirname, resolve } from "path";
import _ from "lodash";

const routesDir = resolve(dirname(fileURLToPath(import.meta.url)))
const srcDir = join(routesDir, "..");
const pagesDir = join(srcDir, "templates", "pages");

const prodRoutes = {
    "/": getPage("Home"),
    "/login": getPage("Login"),
    "/register": getPage("Register"),
    "/profile": getPage("Profile"),
    "/api/[...path]": getRoute("api"),
    "/[...path]": getPage("404"),
};

const devRoutes = {
    "/dev": join(srcDir, "dev", "index.astro"),
};

function getPage(name: string) {
    return join(pagesDir, `${name}.astro`);
}

function getRoute(name: string) {
    return join(routesDir, `${name}.ts`);
}

export function getRoutes() {
    const routes = !import.meta.env.DEV ? prodRoutes : { ...devRoutes, ...prodRoutes };
    return _.mapValues(routes, route => pathToFileURL(route).href);
}