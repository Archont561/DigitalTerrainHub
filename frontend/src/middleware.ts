import { defineMiddleware, sequence } from "astro:middleware";

export const onRequest = sequence(
    defineMiddleware(async (_, next) => {
        try {
            return await next();
        } catch (error) {
            return new Response(JSON.stringify({ error: "Internal Server Error" }));
        }
    }),
    defineMiddleware(async ({ session, locals, request }, next) => {
        let user: App.Locals["user"] = await session?.get("user") || null;
        locals = {
            user,
            isAdmin: user?.role === "admin",
            isLoggedIn: !!user,
            crsfToken: request.headers.get("X-CSRF-Token")
        }
        return await next();
    }),
);