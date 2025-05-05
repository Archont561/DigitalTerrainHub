import { defineConfig } from 'vite';
import path from "path";
import tailwindcss from "@tailwindcss/vite"

export default defineConfig(() => {
    const staticDir = path.resolve("static");
    const jsDir = path.join(staticDir, "js");

    return {
        base: "/static/",
        resolve: {
            alias: {
                "@": path.resolve("./static")
            }
        },
        build: {
            manifest: "manifest.json",
            outDir: path.resolve("dist"),
            emptyOutDir: true,
            assetsDir: "django-assets",
            rollupOptions: {
                input: {
                    main: path.join(jsDir, "main.js"),
                }
            }
        },
        plugins: [
            tailwindcss()
        ]
    }
})