export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const data = await request.formData();

  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) {
    return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const jmeno    = data.get('jmeno')    ?? '—';
  const telefon  = data.get('telefon')  ?? '—';
  const email    = data.get('email')    ?? '—';
  const objekt   = data.get('objekt')   ?? '—';
  const vytapeni = data.get('vytapeni') ?? '—';
  const zprava   = data.get('zprava')   ?? '—';

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

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: 'web@uspornevytapeni.cz',
      to: 'j.krikava@uspornevytapeni.cz',
      reply_to: email,
      subject: `Poptávka: ${jmeno} — ${objekt}`,
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
