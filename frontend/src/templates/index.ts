import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(__dirname, "pages");

export function getRoutes() {
    return {
      "/": join(pagesDir, "Home.astro"),
      "/login": join(pagesDir, "Login.astro"),
      "/register": join(pagesDir, "Register.astro"),
      "/profile": join(pagesDir, "Profile.astro"),
      "components/[...path]": join(pagesDir, "Partials.astro"),
      "/[...path]": join(pagesDir, "404.astro"),
    }
}