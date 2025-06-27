import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(__dirname, "pages");

const prodRoutes = {
  "/": join(pagesDir, "Home.astro"),
  "/login": join(pagesDir, "Login.astro"),
  "/register": join(pagesDir, "Register.astro"),
  "/profile": join(pagesDir, "Profile.astro"),
  "/components/[...path]": join(pagesDir, "Partials.astro"),
  "/[...path]": join(pagesDir, "404.astro"),
};

const devRoutes = {
  "/dev": join(pagesDir, "dev", "Dev.astro"),
};

export function getRoutes() {
  return !import.meta.env.DEV ? prodRoutes : { ...prodRoutes, ...devRoutes };
}