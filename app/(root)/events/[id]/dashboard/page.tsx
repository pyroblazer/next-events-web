import Link from 'next/link'
import { getEventDashboard } from '@/lib/actions/order.actions'
import CheckInForm from '@/components/shared/CheckInForm'
import { formatDateTime, formatPrice } from '@/lib/utils'

export default async function EventDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { event, stats, orders } = await getEventDashboard(id)

  const cards: [string, string][] = [
    ['Tickets sold', String(stats.ticketsSold)],
    ['Revenue', formatPrice(String(stats.revenue))],
    ['Checked in', `${stats.checkedIn} / ${stats.ticketsSold}`],
    ['Remaining', stats.remaining === null ? 'Unlimited' : String(stats.remaining)],
    ['Refunded orders', String(stats.refunded)],
  ]

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover py-5 md:py-10">
        <h1 className="wrapper h3-bold">{event.title} — dashboard</h1>
      </section>

      <section className="wrapper my-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-grey-50 p-4">
            <p className="p-medium-14 text-grey-500">{label}</p>
            <p className="h3-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="wrapper my-8 flex flex-col gap-4">
        <h2 className="h3-bold">Check-in</h2>
        <CheckInForm />
        <Link href={`/api/events/${event._id}/attendees`} className="text-primary-500 underline" prefetch={false}>
          Download attendees (CSV)
        </Link>
      </section>

      <section className="wrapper overflow-x-auto">
        <table className="w-full border-collapse border-t">
          <thead>
            <tr className="p-medium-14 border-b text-grey-500">
              <th className="py-3 text-left">Ticket</th>
              <th className="py-3 text-left">Buyer</th>
              <th className="py-3 text-left">Qty</th>
              <th className="py-3 text-left">Status</th>
              <th className="py-3 text-left">Purchased</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o._id} className="p-regular-14 border-b">
                <td className="py-3 text-primary-500">{o.ticketCode ?? '—'}</td>
                <td className="py-3">{o.buyer?.firstName} {o.buyer?.lastName}</td>
                <td className="py-3">{o.quantity ?? 1}</td>
                <td className="py-3">{o.status === 'refunded' ? 'Refunded' : o.checkedInAt ? 'Checked in' : 'Valid'}</td>
                <td className="py-3">{formatDateTime(o.createdAt).dateTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
