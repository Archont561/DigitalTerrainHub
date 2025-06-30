import { defineMiddleware, sequence } from "astro:middleware";

export default defineMiddleware(async ({ session, locals, request }, next) => {
    const user = locals.user = await session?.get("user") || null;
    locals.isAdmin = user?.role === "admin",
    locals.isLoggedIn = !!user;
    return await next();
});