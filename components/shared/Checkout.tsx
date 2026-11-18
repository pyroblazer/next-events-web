import React, { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js';

import { IEvent } from '@/lib/database/models/event.model';
import { Button } from '../ui/button';
import { checkoutOrder } from '@/lib/actions/order.actions';

loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Checkout = ({ event, userId }: { event: IEvent, userId: string }) => {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      console.log('Order placed! You will receive an email confirmation.');
    }

    if (query.get('canceled')) {
      console.log('Order canceled -- continue to shop around and checkout when you’re ready.');
    }
  }, []);

  const [quantity, setQuantity] = useState(1)

  const onCheckout = async () => {
    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: event.price,
      isFree: event.isFree,
      buyerId: userId,
      quantity,
    }

    await checkoutOrder(order);
  }

  const label = event.isFree ? 'Get Ticket' : 'Buy Ticket'

  return (
    <form action={onCheckout} method="post" className="flex items-center gap-3">
      <label className="p-medium-16" htmlFor="qty">Qty</label>
      <select id="qty" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="h-11 rounded-full bg-grey-50 px-3">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <Button accessibilityLabel={label} type="submit" role="link" size="lg" className="button sm:w-fit">
        {label}
      </Button>
    </form>
  )
}

export default Checkout