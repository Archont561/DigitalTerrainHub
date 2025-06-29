import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async ({ session, locals, request }, next) => {
    let user: App.Locals["user"] = await session?.get("user") || null;
    locals = {
        user,
        isAdmin: user?.role === "admin",
        isLoggedIn: !!user,
        crsfToken: request.headers.get("X-CSRF-Token")
    }
    return next();
});