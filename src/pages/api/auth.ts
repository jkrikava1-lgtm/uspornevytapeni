export const prerender = false;

export async function GET({ request }: { request: Request }) {
  const clientId = import.meta.env.GITHUB_CLIENT_ID;
  const callbackUrl = new URL('/api/callback', request.url).toString();

  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', clientId);
  githubUrl.searchParams.set('redirect_uri', callbackUrl);
  githubUrl.searchParams.set('scope', 'repo');

  return Response.redirect(githubUrl.toString(), 302);
}
