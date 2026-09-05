export const prerender = false;

export async function GET() {
  // Na Vercelu jsou secrets dostupné až za běhu přes process.env —
  // import.meta.env se propisuje při buildu, proto obojí.
  const clientId = import.meta.env.GITHUB_CLIENT_ID ?? process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response(
      'Přihlášení do editoru není nastavené: chybí proměnná GITHUB_CLIENT_ID. ' +
      'Doplňte ji (a GITHUB_CLIENT_SECRET) v nastavení projektu na Vercelu a nasaďte znovu.',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  // Musí odpovídat callback URL zaregistrované v GitHub OAuth App a zároveň
  // kanonické doméně webu (bez www). Kdyby tu bylo www, přesměrování na
  // non-www změní origin vyskakovacího okna a Sveltia zprávu s tokenem zahodí.
  const redirectUri = 'https://uspornevytapeni.cz/api/callback';

  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', clientId);
  githubUrl.searchParams.set('redirect_uri', redirectUri);
  githubUrl.searchParams.set('scope', 'repo');

  return Response.redirect(githubUrl.toString(), 302);
}
