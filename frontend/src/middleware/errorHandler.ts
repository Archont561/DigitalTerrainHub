import { defineMiddleware } from "astro:middleware";

export default defineMiddleware(async (_, next) => {
    try {
        return await next();
    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }));
    }
});