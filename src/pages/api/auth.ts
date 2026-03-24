export const prerender = false;

export async function GET() {
  const clientId = import.meta.env.GITHUB_CLIENT_ID;
  const redirectUri = 'https://www.uspornevytapeni.cz/api/callback';

  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', clientId);
  githubUrl.searchParams.set('redirect_uri', redirectUri);
  githubUrl.searchParams.set('scope', 'repo');

  return Response.redirect(githubUrl.toString(), 302);
}
