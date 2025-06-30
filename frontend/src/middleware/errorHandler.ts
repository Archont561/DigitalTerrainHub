import { defineMiddleware } from "astro:middleware";
import { render } from "@utils";
import { ServerErrorPage, NotFoundErrorPage } from "@pages";
import { ErrorFlow, Errors } from "@utils";

const { NotFoundError, InternalError } = Errors;

export default defineMiddleware(async (context, next) => {
    return (await ErrorFlow.runAsync(next))
        .onError(NotFoundError, () => render(NotFoundErrorPage, context, 404))
        .onError(InternalError, () => render(ServerErrorPage, context, 500))
        .otherwise(result => result)!;
});

