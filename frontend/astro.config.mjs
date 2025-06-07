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
    server: {
      allowedHosts: [
        "frontend",
        "localhost",
      ]
    }
  },

  integrations: [
    alpinejs(), 
    icon({
      include: {
        "ooui": ["article-not-found-ltr", "upload"],
        "mage": ["edit"],
        "mdi": ["arrow-up-circle"],
        "heroicons": ["x-mark", "bars-4-16-solid"],
        "iconoir": ["plus-circle"],
        "ion": ["*"],
        "tabler": ["trash"],
        "tdesign": ["adjustment"],
        "ep": ["upload-filled"],
        "fa-solid": ["hands-helping"],
        "mingcute": ["lock-line"],
      }
    }),
  ],

  adapter: node({
    mode: "standalone"
  })
});