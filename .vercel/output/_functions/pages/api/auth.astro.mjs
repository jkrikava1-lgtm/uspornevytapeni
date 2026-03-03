export { renderers } from '../../renderers.mjs';

const prerender = false;
async function GET({ request }) {
  const clientId = undefined                                ;
  const callbackUrl = new URL("/api/callback", request.url).toString();
  const githubUrl = new URL("https://github.com/login/oauth/authorize");
  githubUrl.searchParams.set("client_id", clientId);
  githubUrl.searchParams.set("redirect_uri", callbackUrl);
  githubUrl.searchParams.set("scope", "repo");
  return Response.redirect(githubUrl.toString(), 302);
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
