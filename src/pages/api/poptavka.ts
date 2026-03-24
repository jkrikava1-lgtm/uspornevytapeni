export const prerender = false;

import nodemailer from 'nodemailer';

export async function POST({ request }: { request: Request }) {
  const data = await request.json();

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
  const objekt   = data.objekt   ?? '—';
  const vytapeni = data.vytapeni ?? '—';
  const zprava   = data.zprava   ?? '—';

  const body = `
Nová nezávazná poptávka z webu
================================
Jméno:            ${jmeno}
Telefon:          ${telefon}
E-mail:           ${email}
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
