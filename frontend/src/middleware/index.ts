import { sequence } from "astro:middleware";
import errorHandler from "./errorHandler";
import authHandler from "./authHandler";

export const onRequest = sequence(
    errorHandler,
    authHandler,
);