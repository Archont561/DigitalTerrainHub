import { fileURLToPath, pathToFileURL } from "url";
import { join, dirname, resolve } from "path";
import _ from "lodash";

const pagesDir = dirname(fileURLToPath(import.meta.url));

const prodRoutes = {
  "/": join(pagesDir, "Home.astro"),
  "/login": join(pagesDir, "Login.astro"),
  "/register": join(pagesDir, "Register.astro"),
  "/profile": join(pagesDir, "Profile.astro"),
  "/components/[...path]": join(pagesDir, "Partials.astro"),
  "/[...path]": join(pagesDir, "404.astro"),
};

const devRoutes = {
  "/dev": join(pagesDir, "dev", "index.astro"),
};

export function getRoutes() {
  const routes = !import.meta.env.DEV ? prodRoutes : { ...prodRoutes, ...devRoutes };
  return _.mapValues(routes, route => pathToFileURL(route).href);
}