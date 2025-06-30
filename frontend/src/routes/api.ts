import type { APIRoute } from "astro";

export const ALL: APIRoute = async ({ request, params }) => {
  const url = new URL(request.url);
  const newUrl = new URL(`${import.meta.env.PUBLIC_DJANGO_URL}${url.pathname}${url.search}`)
  const headers = new Headers(request.headers);

  const forwarded = await (async () => {
    try {
      return await fetch(newUrl.toString(), {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.clone().blob(),
      });
    } catch (err) {
      throw err;
    }
  })();


  if (forwarded.status === 404) {
    throw new Error("404");
  }

  if (forwarded.status > 500) {
    throw new Error("500");
  }

  const contentType = forwarded.headers.get("content-type") ?? "text/plain";
  const body = await forwarded.arrayBuffer();


  return new Response(body, {
    status: forwarded.status,
    headers: {
      "content-type": contentType,
    },
  });
};
