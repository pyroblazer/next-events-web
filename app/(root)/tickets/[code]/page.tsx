import QRCode from 'qrcode'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTicketByCode } from '@/lib/actions/order.actions'
import { formatDateTime } from '@/lib/utils'

export const metadata = { title: 'Your ticket', robots: { index: false } }

export default async function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const ticket = await getTicketByCode(code)
  if (!ticket || !ticket.event) notFound()

  const qr = await QRCode.toDataURL(ticket.ticketCode, { margin: 1, width: 280 })
  const refunded = ticket.status === 'refunded'

  return (
    <section className="wrapper my-10 flex flex-col items-center gap-4 text-center">
      <h1 className="h2-bold">{ticket.event.title}</h1>
      <p className="p-medium-16">{formatDateTime(ticket.event.startDateTime).dateTime} · {ticket.event.location}</p>
      <Image src={qr} alt={`QR code for ticket ${ticket.ticketCode}`} width={280} height={280} unoptimized className={refunded ? 'opacity-30' : ''} />
      <p className="p-bold-20">{ticket.ticketCode}</p>
      <p className="p-medium-16 text-grey-500">Admits {ticket.quantity}</p>
      {refunded && <p role="alert" className="text-red-500">This ticket was refunded and is no longer valid.</p>}
      {ticket.checkedInAt && <p className="text-green-700">Checked in {formatDateTime(ticket.checkedInAt).dateTime}</p>}
    </section>
  )
}
