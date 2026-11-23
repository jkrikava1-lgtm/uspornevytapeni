export const prerender = true;

export function GET() {
  return new Response(JSON.stringify({ v: process.env.VERCEL_GIT_COMMIT_SHA || "dev" }), {
    headers: { "Content-Type": "application/json" },
  });
}
