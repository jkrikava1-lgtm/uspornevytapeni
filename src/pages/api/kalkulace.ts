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

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const body = `
Nová cenová kalkulace z webu
============================
Typ objektu:        ${data.typ_objektu ?? '—'}
Ohřev TUV:          ${data.ohrev_tuv ?? '—'}
Topný systém:       ${data.topny_system ?? '—'}
Typ TČ:             ${data.typ_tc ?? '—'}
Tepelná ztráta:     ${data.tepelna_ztrata ?? '—'}
Vytápěná plocha:    ${data.plocha ?? '—'}

Kontakt
-------
Jméno:    ${data.jmeno}
E-mail:   ${data.email}
Telefon:  ${data.telefon}
Obec:     ${data.obec}
Souhlas s obch. sděleními: ${data.souhlas_obchodni ? 'Ano' : 'Ne'}
`.trim();

  try {
    await transporter.sendMail({
      from: `"Úsporné vytápění" <${from}>`,
      to: 'info@uspornevytapeni.cz',
      replyTo: data.email,
      subject: `Kalkulace TČ: ${data.jmeno} (${data.obec})`,
      text: body,
    });
  } catch (err) {
    console.error('SMTP error:', err);
    return Response.json({ error: 'Email send failed' }, { status: 500 });
  }

  return Response.json({ success: true });
}
