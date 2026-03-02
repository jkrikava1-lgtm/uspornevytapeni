export const prerender = false;

export async function GET({ url }: { url: URL }) {
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Chybí autorizační kód.', { status: 400 });
  }

  const clientId = import.meta.env.GITHUB_CLIENT_ID;
  const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET;

  let token: string;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await res.json() as { access_token?: string; error?: string };
    if (!data.access_token) {
      return new Response('GitHub vrátil chybu: ' + (data.error ?? 'unknown'), { status: 400 });
    }
    token = data.access_token;
  } catch {
    return new Response('Chyba při komunikaci s GitHubem.', { status: 500 });
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
<\/script></body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
