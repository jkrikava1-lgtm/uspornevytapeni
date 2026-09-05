export const prerender = false;

export async function GET({ url }: { url: URL }) {
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Chybí autorizační kód.', { status: 400 });
  }

  const clientId = import.meta.env.GITHUB_CLIENT_ID ?? process.env.GITHUB_CLIENT_ID;
  const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET ?? process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('Přihlášení do editoru není nastavené: chybí GITHUB_CLIENT_ID nebo GITHUB_CLIENT_SECRET.', {
      status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

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

  // Editor otevírá přihlášení ve vyskakovacím okně a čeká na postMessage.
  // Když se sem někdo dostane napřímo (bez openeru), token nemá komu předat —
  // v tom případě to radši srozumitelně vysvětlíme, než abychom nechali bílou stránku.
  const html = `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8"><title>Přihlášení do editoru</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;max-width:34rem;margin:15vh auto;padding:0 1.5rem;color:#1c1c1c;line-height:1.6}
  h1{font-size:1.25rem;margin:0 0 .75rem}
  p{color:#4a4a4a}
  a{display:inline-block;margin-top:1rem;background:#c41e2a;color:#fff;text-decoration:none;padding:.7rem 1.4rem;border-radius:.5rem;font-weight:700}
</style></head>
<body>
<div id="stav">
  <h1>Přihlašuji do editoru…</h1>
  <p>Za okamžik se okno samo zavře.</p>
</div>
<script>
(function() {
  var payload = 'authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(token)}, provider: 'github' });

  if (!window.opener) {
    document.getElementById('stav').innerHTML =
      '<h1>Přihlášení je potřeba spustit z editoru</h1>' +
      '<p>Tahle stránka jen předává přihlášení zpět do editoru obsahu a sama o sobě nic neudělá. ' +
      'Otevřete editor a klikněte v něm na <strong>Sign in with GitHub</strong>.</p>' +
      '<a href="/admin/">Otevřít editor obsahu</a>';
    return;
  }

  function receiveMessage(e) {
    window.opener.postMessage(payload, e.origin);
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
<\/script>
</body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
