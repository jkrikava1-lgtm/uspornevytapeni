export const prerender = false;

import nodemailer from 'nodemailer';
import { timingSafeEqual } from 'node:crypto';

/**
 * Health-check SMTP pro externí monitoring (UptimeRobot).
 *
 * Endpoint je chráněný tokenem, protože bez něj ho mohl volat kdokoli:
 * každé zavolání otevírá ověřené spojení na poštovní server a chybová
 * hláška serveru obvykle prozradí jeho adresu i uživatele.
 *
 * Bez platného tokenu vrací 404, aby se nedalo poznat, že tu endpoint je.
 * Když token není nastavený v proměnných prostředí, je endpoint vypnutý.
 */

const NENALEZENO = new Response('Not found', { status: 404 });

function tokenSedi(zadany: string | null, ocekavany: string): boolean {
  if (!zadany) return false;
  const a = Buffer.from(zadany);
  const b = Buffer.from(ocekavany);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET({ url }: { url: URL }) {
  const ocekavany = import.meta.env.SMTP_CHECK_TOKEN;
  if (!ocekavany) return NENALEZENO;
  if (!tokenSedi(url.searchParams.get('token'), ocekavany)) return NENALEZENO;

  const host = import.meta.env.SMTP_HOST;
  const port = Number(import.meta.env.SMTP_PORT);
  const user = import.meta.env.SMTP_USER;
  const pass = import.meta.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return Response.json({ ok: false, error: 'SMTP not configured' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.verify();
    return Response.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
