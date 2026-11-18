import stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createOrder, markOrderRefunded } from '@/lib/actions/order.actions'

export async function POST(request: Request) {
  const body = await request.text()

  const sig = request.headers.get('stripe-signature') as string
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: 'Webhook error' }, { status: 400 })
  }

  // Get the ID and type
  const eventType = event.type

  // CREATE
  if (eventType === 'checkout.session.completed') {
    const { id, amount_total, metadata, payment_intent } = event.data.object

    const order = {
      stripeId: id,
      eventId: metadata?.eventId || '',
      buyerId: metadata?.buyerId || '',
      totalAmount: amount_total ? (amount_total / 100).toString() : '0',
      quantity: Number(metadata?.quantity) || 1,
      paymentIntentId: typeof payment_intent === 'string' ? payment_intent : undefined,
      createdAt: new Date(),
    }

    const newOrder = await createOrder(order)
    return NextResponse.json({ message: 'OK', order: newOrder })
  }

  if (eventType === 'charge.refunded') {
    const charge = event.data.object
    if (typeof charge.payment_intent === 'string') await markOrderRefunded(charge.payment_intent)
    return NextResponse.json({ message: 'Refund recorded' })
  }

  return new Response('', { status: 200 })
}
