'use client'

import { useState } from 'react'
import { checkInTicket } from '@/lib/actions/order.actions'

export default function CheckInForm() {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await checkInTicket(code)
    setMsg(res.ok ? { ok: true, text: `Checked in ${res.quantity} guest(s)` } : { ok: false, text: res.reason })
    if (res.ok) setCode('')
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
      <input
        aria-label="Ticket code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="TKT-XXXXXXXXXXXX"
        className="h-11 rounded-full bg-grey-50 px-4"
      />
      <button type="submit" className="button rounded-full px-6 py-2">Check in</button>
      {msg && <p role="status" className={msg.ok ? 'text-green-700' : 'text-red-500'}>{msg.text}</p>}
    </form>
  )
}
