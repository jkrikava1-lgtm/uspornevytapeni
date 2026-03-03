export { renderers } from '../../renderers.mjs';

const prerender = false;
async function GET({ url }) {
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Chybí autorizační kód.", { status: 400 });
  }
  const clientId = undefined                                ;
  const clientSecret = undefined                                    ;
  let token;
  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    const data = await res.json();
    if (!data.access_token) {
      return new Response("GitHub vrátil chybu: " + (data.error ?? "unknown"), { status: 400 });
    }
    token = data.access_token;
  } catch {
    return new Response("Chyba při komunikaci s GitHubem.", { status: 500 });
  }
  const html = `<!DOCTYPE html>
<html><body><script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:{"token":"${token}","provider":"github"}',
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
