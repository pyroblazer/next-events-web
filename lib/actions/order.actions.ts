"use server"

import Stripe from 'stripe';
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types"
import { redirect } from 'next/navigation';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Order from '../database/models/order.model';
import Event from '../database/models/event.model';
import {ObjectId} from 'mongodb';
import User from '../database/models/user.model';
import { requireUserId } from '../auth';
import { escapeRegExp } from '../utils';

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  // Never trust price / isFree / buyer from the client: load the event and use the session user.
  const buyerId = requireUserId();
  await connectToDatabase();

  const event = await Event.findById(order.eventId);
  if (!event) throw new Error('Event not found');

  if (event.isFree || Number(event.price) <= 0) {
    await Order.create({
      stripeId: `free_${new ObjectId().toHexString()}`,
      event: event._id,
      buyer: buyerId,
      totalAmount: '0',
    });
    redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile`);
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
        quantity: 1
      },
    ],
    metadata: {
      eventId: String(event._id),
      buyerId,
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
    
    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: order.buyerId,
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
}

// GET ORDERS BY EVENT
export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
  try {
    await connectToDatabase()

    if (!eventId) throw new Error('Event ID is required')
    const eventObjectId = new ObjectId(eventId)

    // Only the organizer of the event may list its orders
    const userId = requireUserId()
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
