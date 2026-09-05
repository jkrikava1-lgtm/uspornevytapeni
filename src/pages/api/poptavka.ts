export const prerender = false;

import nodemailer from 'nodemailer';

// Rate limiting: max 5 požadavků za 10 minut per IP
const rateMap = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000; // 10 minut
  const max = 5;
  const hits = (rateMap.get(ip) || []).filter(t => now - t < window);
  hits.push(now);
  rateMap.set(ip, hits);
  // Cleanup starých IP (každých 100 požadavků)
  if (rateMap.size > 1000) {
    for (const [key, times] of rateMap) {
      if (times.every(t => now - t > window)) rateMap.delete(key);
    }
  }
  return hits.length > max;
}

export async function POST({ request }: { request: Request }) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return Response.json({ error: 'Příliš mnoho požadavků. Zkuste to za chvíli.' }, { status: 429 });
  }

  const data = await request.json();

  // Anti-spam: honeypot
  if (data.website) {
    return Response.json({ success: true }); // Tiše přijmi, ale neposílej
  }

  // Anti-spam: formulář odeslán příliš rychle (pod 3 sekundy = bot)
  const loaded = Number(data._loaded);
  if (loaded && Date.now() - loaded < 3000) {
    return Response.json({ success: true }); // Tiše přijmi, ale neposílej
  }

  const host = import.meta.env.SMTP_HOST;
  const port = Number(import.meta.env.SMTP_PORT);
  const user = import.meta.env.SMTP_USER;
  const pass = import.meta.env.SMTP_PASS;
  const from = import.meta.env.SMTP_FROM;

  if (!host || !user || !pass) {
    return Response.json({ error: 'SMTP not configured' }, { status: 500 });
  }

  const jmeno    = data.jmeno    ?? '—';
  const telefon  = data.telefon  ?? '—';
  const email    = data.email    ?? '—';
  const obec     = data.obec     ?? '—';
  const objekt   = data.objekt   ?? '—';
  const vytapeni = data.vytapeni ?? '—';
  const zprava   = data.zprava   ?? '—';
  const zdroj    = data.zdroj    ?? 'Web (formulář poptávky)';

  const body = `
Nová nezávazná poptávka z webu
================================
Zdroj:            ${zdroj}
Jméno:            ${jmeno}
Telefon:          ${telefon}
E-mail:           ${email}
Obec / město:     ${obec}
Typ objektu:      ${objekt}
Stávající zdroj:  ${vytapeni}

Zpráva:
${zprava}
`.trim();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const mailOptions: any = {
    from: `"Úsporné vytápění" <${from}>`,
    to: 'info@uspornevytapeni.cz',
    replyTo: String(email),
    subject: `Poptávka: ${jmeno} — ${objekt}`,
    text: body,
  };

  if (data.priloha?.data) {
    mailOptions.attachments = [{
      filename: data.priloha.name,
      content: Buffer.from(data.priloha.data, 'base64'),
      contentType: data.priloha.type,
    }];
  }

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('SMTP error:', err);
    return Response.json({ error: 'Email send failed' }, { status: 500 });
  }

  return Response.json({ success: true });
}
