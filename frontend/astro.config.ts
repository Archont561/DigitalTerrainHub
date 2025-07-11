import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import icon from 'astro-icon';
import dotenv from 'dotenv';
import node from '@astrojs/node';
import { strictCustomRouting } from '@inox-tools/custom-routing';
import { getRoutes } from "./src/routes";

dotenv.config();
const AlpineJSEntrypointURL = "./src/lib/Alpine/index.ts";

export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['frontend', 'localhost', 'host.docker.internal'],
    },
  },

  integrations: [
    strictCustomRouting(getRoutes()),
    alpinejs({ entrypoint: AlpineJSEntrypointURL }),
    icon({
      include: {
        ooui: ['article-not-found-ltr', 'upload', 'error', 'success'],
        mage: ['edit'],
        mdi: ['arrow-up-circle', 'warning', 'chevron-up', 'bell'],
        heroicons: [
          'x-mark', 
          'bars-4-16-solid', 
          'information-circle-20-solid', 
          'bars-4', 
          'x-mark-16-solid',
          'home',
          'wrench-screwdriver',
          'archive-box',
          'queue-list',
          'cog-8-tooth',
        ],
        iconoir: ['plus-circle'],
        ion: ['*'],
        tabler: ['trash', 'briefcase'],
        tdesign: ['adjustment'],
        ep: ['upload-filled'],
        'fa-solid': ['hands-helping'],
        mingcute: ['lock-line'],
      },
    }),
  ],

  adapter: node({
    mode: 'standalone',
  }),
});