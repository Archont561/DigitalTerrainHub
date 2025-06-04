import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import icon from 'astro-icon';
import dotenv from "dotenv";
import node from "@astrojs/node";
dotenv.config();

// https://astro.build/config
export default defineConfig({
  base: "/astro/",
  output: "server",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    alpinejs(), 
    icon({
      include: {
        "ooui": ["article-not-found-ltr"],
      }
    }),
  ],

  adapter: node({
    mode: "standalone"
  })
});