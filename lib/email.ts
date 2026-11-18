/** Sends a transactional email through Resend. A no-op (returns false) when RESEND_API_KEY is not set. */
export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || 'Celebrate Connect <onboarding@resend.dev>', ...opts }),
    })
    return res.ok
  } catch (err) {
    console.error('[email]', err)
    return false
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

export function ticketEmailHtml(p: { eventTitle: string; ticketCode: string; quantity: number; url: string }) {
  return `<h2>Your ticket for ${esc(p.eventTitle)}</h2><p>Ticket code: <b>${esc(p.ticketCode)}</b> (admits ${p.quantity})</p><p><a href="${esc(p.url)}">View your QR ticket</a></p>`
}
