const mount = "/lemartini/";
const source = "https://djrozzo-glitch.github.io/lemartini/";

export async function onRequest({ request }) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const url = new URL(request.url);
  if (url.pathname === "/lemartini") {
    url.pathname = mount;
    return Response.redirect(url, 308);
  }

  const path = url.pathname.slice(mount.length);
  const upstream = new URL(source);
  upstream.pathname += path;
  if (!upstream.pathname.startsWith(mount)) {
    return new Response("Not found", { status: 404 });
  }
  upstream.search = url.search;

  const headers = new Headers();
  for (const name of ["Range", "If-Range", "If-None-Match", "If-Modified-Since"]) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }

  const response = await fetch(upstream, { method: request.method, headers, redirect: "manual" });
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("Set-Cookie");
  if (!path || path.endsWith(".html")) responseHeaders.set("Cache-Control", "no-cache");
  return new Response(response.body, { status: response.status, headers: responseHeaders });
}
