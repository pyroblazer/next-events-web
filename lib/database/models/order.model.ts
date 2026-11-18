import { Schema, model, models, Document } from 'mongoose'

export interface IOrder extends Document {
  createdAt: Date
  stripeId: string
  totalAmount: string
  quantity: number
  ticketCode: string
  status: "paid" | "refunded"
  checkedInAt?: Date
  paymentIntentId?: string
  event: {
    _id: string
    title: string
  }
  buyer: {
    _id: string
    firstName: string
    lastName: string
  }
}

export type IOrderItem = {
  _id: string
  totalAmount: string
  createdAt: Date
  eventTitle: string
  eventId: string
  buyer: string
}

const OrderSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stripeId: {
    type: String,
    required: true,
    unique: true,
  },
  totalAmount: {
    type: String,
  },
  quantity: { type: Number, default: 1, min: 1 },
  ticketCode: { type: String, unique: true, sparse: true, index: true },
  status: { type: String, enum: ["paid", "refunded"], default: "paid" },
  checkedInAt: { type: Date },
  paymentIntentId: { type: String, index: true },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
})

const Order = models.Order || model('Order', OrderSchema)

export default Order
