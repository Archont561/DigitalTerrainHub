import { defineConfig } from 'vite';
import path from "path";

export default defineConfig(() => {
    const src = path.resolve("src");
    const staticDir = path.resolve("../static");
    const jsDir = path.join(src, "ts");

    return {
        base: "/static/",
        resolve: {
            alias: {
                "@": path.resolve("./static")
            }
        },
        build: {
            manifest: "manifest.json",
            outDir: staticDir,
            emptyOutDir: true,
            assetsDir: "dist",
            rollupOptions: {
                input: {
                    main: path.join(jsDir, "main.ts"),
                }
            }
        }
    }
})