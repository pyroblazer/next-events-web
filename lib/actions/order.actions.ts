"use server"

import Stripe from 'stripe';
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types"
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Order from '../database/models/order.model';
import Event from '../database/models/event.model';
import {ObjectId} from 'mongodb';
import User from '../database/models/user.model';
import { requireUserId } from '../auth';
import { escapeRegExp } from '../utils';
import { canPurchase, clampQuantity, generateTicketCode, remainingCapacity } from '../tickets';
import { sendEmail, ticketEmailHtml } from '../email';

/** Number of tickets sold (not refunded) for an event. */
async function countTicketsSold(eventId: string | ObjectId): Promise<number> {
  const agg = await Order.aggregate([
    { $match: { event: new ObjectId(String(eventId)), status: { $ne: 'refunded' } } },
    { $group: { _id: null, total: { $sum: { $ifNull: ['$quantity', 1] } } } },
  ])
  return agg[0]?.total ?? 0
}

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  // Never trust price / isFree / buyer from the client: load the event and use the session user.
  const buyerId = await requireUserId();
  await connectToDatabase();

  const event = await Event.findById(order.eventId);
  if (!event) throw new Error('Event not found');
  if (new Date(event.endDateTime) < new Date()) throw new Error('This event has already finished');

  const quantity = clampQuantity(order.quantity);
  const sold = await countTicketsSold(event._id);
  if (!canPurchase(event.capacity, sold, quantity)) {
    throw new Error(`Only ${remainingCapacity(event.capacity, sold)} ticket(s) left`);
  }

  if (event.isFree || Number(event.price) <= 0) {
    const created = await createOrder({
      stripeId: `free_${new ObjectId().toHexString()}`,
      eventId: String(event._id),
      buyerId,
      totalAmount: '0',
      quantity,
      createdAt: new Date(),
    });
    redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/tickets/${created.ticketCode}`);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(Number(event.price) * 100),
          product_data: {
            name: event.title
          }
        },
        quantity
      },
    ],
    metadata: {
      eventId: String(event._id),
      buyerId,
      quantity: String(quantity),
    },
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/?canceled=1`,
  });

  redirect(session.url!)
}

export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();

    // Stripe retries webhooks: make order creation idempotent on the Stripe session id.
    const existing = await Order.findOne({ stripeId: order.stripeId });
    if (existing) return JSON.parse(JSON.stringify(existing));

    const newOrder = await Order.create({
      ...order,
      quantity: clampQuantity(order.quantity),
      ticketCode: generateTicketCode(),
      event: order.eventId,
      buyer: order.buyerId,
    });

    try {
      const [buyer, event] = await Promise.all([User.findById(order.buyerId), Event.findById(order.eventId)]);
      if (buyer?.email && event) {
        await sendEmail({
          to: buyer.email,
          subject: `Your ticket for ${event.title}`,
          html: ticketEmailHtml({
            eventTitle: event.title,
            ticketCode: newOrder.ticketCode,
            quantity: newOrder.quantity,
            url: `${process.env.NEXT_PUBLIC_SERVER_URL}/tickets/${newOrder.ticketCode}`,
          }),
        });
      }
    } catch (mailErr) {
      console.error('[order email]', mailErr);
    }

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
}

/** Called from the Stripe webhook on charge.refunded. */
export async function markOrderRefunded(paymentIntentId: string) {
  await connectToDatabase()
  return Order.findOneAndUpdate({ paymentIntentId }, { status: 'refunded' }, { new: true })
}

/** Organizer check-in: validates the ticket belongs to one of the caller's events. */
export async function checkInTicket(ticketCode: string) {
  const userId = await requireUserId()
  await connectToDatabase()

  const order = await Order.findOne({ ticketCode: String(ticketCode).trim().toUpperCase() })
  if (!order) return { ok: false as const, reason: 'Ticket not found' }

  const event = await Event.findOne({ _id: order.event, organizer: userId })
  if (!event) return { ok: false as const, reason: 'Not your event' }
  if (order.status === 'refunded') return { ok: false as const, reason: 'Ticket was refunded' }
  if (order.checkedInAt) return { ok: false as const, reason: 'Already checked in' }

  order.checkedInAt = new Date()
  await order.save()
  revalidatePath(`/events/${event._id}/dashboard`)
  return { ok: true as const, quantity: order.quantity as number, eventTitle: event.title as string }
}

/** Organizer-only sales summary for an event. */
export async function getEventDashboard(eventId: string) {
  const userId = await requireUserId()
  await connectToDatabase()

  const event = await Event.findOne({ _id: eventId, organizer: userId })
  if (!event) throw new Error('Unauthorized')

  const orders = await Order.find({ event: event._id })
    .populate({ path: 'buyer', model: User, select: 'firstName lastName email' })
    .sort({ createdAt: -1 })
    .lean()
  const paid = orders.filter((o: any) => o.status !== 'refunded')
  const ticketsSold = paid.reduce((n: number, o: any) => n + (o.quantity ?? 1), 0)
  const revenue = paid.reduce((n: number, o: any) => n + Number(o.totalAmount || 0), 0)
  const checkedIn = paid.filter((o: any) => o.checkedInAt).reduce((n: number, o: any) => n + (o.quantity ?? 1), 0)

  return JSON.parse(JSON.stringify({
    event: { _id: event._id, title: event.title, capacity: event.capacity ?? 0 },
    stats: {
      ticketsSold,
      revenue,
      checkedIn,
      refunded: orders.length - paid.length,
      remaining: remainingCapacity(event.capacity, ticketsSold),
    },
    orders,
  }))
}

/** Public lookup for the ticket page (the code is unguessable). */
export async function getTicketByCode(ticketCode: string) {
  await connectToDatabase()
  const order = await Order.findOne({ ticketCode: String(ticketCode).toUpperCase() })
    .populate({ path: 'event', model: Event, select: 'title location startDateTime endDateTime imageUrl' })
    .lean()
  return order ? JSON.parse(JSON.stringify(order)) : null
}

// GET ORDERS BY EVENT
export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
  try {
    await connectToDatabase()

    if (!eventId) throw new Error('Event ID is required')
    const eventObjectId = new ObjectId(eventId)

    // Only the organizer of the event may list its orders
    const userId = await requireUserId()
    const ownedEvent = await Event.exists({ _id: eventObjectId, organizer: userId })
    if (!ownedEvent) throw new Error('Unauthorized')

    const orders = await Order.aggregate([
      { $match: { event: eventObjectId } },
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      {
        $unwind: '$buyer',
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          ticketCode: 1,
          quantity: 1,
          status: 1,
          checkedInAt: 1,
          eventTitle: '$event.title',
          eventId: '$event._id',
          buyer: {
            $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
          },
        },
      },
      {
        $match: {
          $and: [{ eventId: eventObjectId }, { buyer: { $regex: RegExp(escapeRegExp(searchString), 'i') } }],
        },
      },
    ])

    return JSON.parse(JSON.stringify(orders))
  } catch (error) {
    handleError(error)
  }
}

// GET ORDERS BY USER
export async function getOrdersByUser({ userId, limit = 3, page }: GetOrdersByUserParams) {
  try {
    await connectToDatabase()

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { buyer: userId }

    const [orders, ordersCount] = await Promise.all([
      Order.find(conditions)
        .sort({ createdAt: 'desc' })
        .skip(skipAmount)
        .limit(limit)
        .populate({
          path: 'event',
          model: Event,
          populate: {
            path: 'organizer',
            model: User,
            select: '_id firstName lastName',
          },
        }),
      Order.countDocuments(conditions),
    ])

    return { data: JSON.parse(JSON.stringify(orders)), totalPages: Math.ceil(ordersCount / limit) }
  } catch (error) {
    handleError(error)
  }
}
