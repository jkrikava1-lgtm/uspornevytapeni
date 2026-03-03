export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const data = await request.json();

  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) {
    return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

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

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: 'web@uspornevytapeni.cz',
      to: 'info@uspornevytapeni.cz',
      reply_to: data.email,
      subject: `Kalkulace TČ: ${data.jmeno} (${data.obec})`,
      text: body,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return Response.json({ error: 'Email send failed' }, { status: 500 });
  }

  return Response.json({ success: true });
}
