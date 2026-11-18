import { auth } from '@clerk/nextjs'
import { getEventDashboard } from '@/lib/actions/order.actions'
import { buildAttendeesCsv } from '@/lib/tickets'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { sessionClaims } = auth()
  if (!sessionClaims?.userId) return new Response('Unauthorized', { status: 401 })

  try {
    const { orders } = await getEventDashboard(params.id)
    const csv = buildAttendeesCsv(
      orders.map((o: any) => ({
        ticketCode: o.ticketCode ?? '',
        buyer: `${o.buyer?.firstName ?? ''} ${o.buyer?.lastName ?? ''}`.trim(),
        email: o.buyer?.email,
        quantity: o.quantity ?? 1,
        totalAmount: o.totalAmount ?? '0',
        status: o.status ?? 'paid',
        checkedInAt: o.checkedInAt,
        createdAt: o.createdAt,
      }))
    )
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="attendees-${params.id}.csv"`,
      },
    })
  } catch {
    return new Response('Forbidden', { status: 403 })
  }
}
