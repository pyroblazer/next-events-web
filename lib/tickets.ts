import { randomBytes } from 'crypto'

export const MAX_TICKETS_PER_ORDER = 10

/** Human-friendly, unguessable ticket code (e.g. TKT-9F2A7C1D3B4E). */
export function generateTicketCode(): string {
  return `TKT-${randomBytes(6).toString('hex').toUpperCase()}`
}

export function clampQuantity(value: unknown): number {
  const n = Math.floor(Number(value))
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, MAX_TICKETS_PER_ORDER)
}

/** Seats left, or null when the event has no capacity limit. */
export function remainingCapacity(capacity: number | null | undefined, sold: number): number | null {
  if (!capacity || capacity <= 0) return null
  return Math.max(capacity - sold, 0)
}

export function canPurchase(capacity: number | null | undefined, sold: number, quantity: number): boolean {
  const left = remainingCapacity(capacity, sold)
  return left === null || quantity <= left
}

const csvCell = (v: unknown) => {
  let s = String(v ?? '')
  // neutralise spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export type AttendeeRow = {
  ticketCode: string
  buyer: string
  email?: string
  quantity: number
  totalAmount: string
  status: string
  checkedInAt?: Date | string | null
  createdAt: Date | string
}

export function buildAttendeesCsv(rows: AttendeeRow[]): string {
  const header = ['Ticket', 'Buyer', 'Email', 'Quantity', 'Amount', 'Status', 'Checked in', 'Purchased']
  const lines = rows.map((r) =>
    [
      r.ticketCode,
      r.buyer,
      r.email ?? '',
      r.quantity,
      r.totalAmount,
      r.status,
      r.checkedInAt ? new Date(r.checkedInAt).toISOString() : '',
      new Date(r.createdAt).toISOString(),
    ]
      .map(csvCell)
      .join(',')
  )
  return [header.map(csvCell).join(','), ...lines].join('\r\n')
}
