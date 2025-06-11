import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getRoutes() {
    return {
      "/": join(__dirname, "Home.astro"),
      "/login": join(__dirname, "Login.astro"),
      "/register": join(__dirname, "Register.astro"),
      "/profile": join(__dirname, "Profile.astro"),
      "components/[...path]": join(__dirname, "Partials.astro"),
      "/[...path]": join(__dirname, "404.astro"),
    }
}