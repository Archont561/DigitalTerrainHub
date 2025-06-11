import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import icon from 'astro-icon';
import dotenv from 'dotenv';
import node from '@astrojs/node';
import { strictCustomRouting } from '@inox-tools/custom-routing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const getView = (file: string) => join(__dirname, "src/templates", file);

dotenv.config();
export const isDev = import.meta.env.DEV;
export const baseURL = process.env.ASTRO_BASE_URL ?? "/astro";

export default defineConfig({
    base: isDev ? undefined : baseURL,
    output: 'server',

    vite: {
      base: isDev ? baseURL : undefined,
      plugins: [tailwindcss()],
      server: {
        allowedHosts: ['frontend', 'localhost', 'host.docker.internal'],
      },
    },

    integrations: [
      alpinejs({ entrypoint: './src/lib/Alpine/index.ts' }), 
      icon({
        include: {
          ooui: ['article-not-found-ltr', 'upload', 'error', 'success'],
          mage: ['edit'],
          mdi: ['arrow-up-circle', 'warning'],
          heroicons: ['x-mark', 'bars-4-16-solid', 'information-circle-20-solid'],
          iconoir: ['plus-circle'],
          ion: ['*'],
          tabler: ['trash'],
          tdesign: ['adjustment'],
          ep: ['upload-filled'],
          'fa-solid': ['hands-helping'],
          mingcute: ['lock-line'],
        },
      }),
      strictCustomRouting({
        "/": getView("Home.astro"),
        "/login": getView("Login.astro"),
        "/register": getView("Register.astro"),
        "/profile": getView("Profile.astro"),
        "components/[...path]": getView("Partials.astro"),
        "/[...path]": getView("404.astro"),
      })
    ],

    adapter: node({
      mode: 'standalone',
    }),
});