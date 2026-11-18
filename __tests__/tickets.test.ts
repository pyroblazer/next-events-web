import {
  MAX_TICKETS_PER_ORDER,
  buildAttendeesCsv,
  canPurchase,
  clampQuantity,
  generateTicketCode,
  remainingCapacity,
} from '@/lib/tickets'

describe('tickets', () => {
  it('generates unique, well-formed ticket codes', () => {
    const codes = new Set(Array.from({ length: 200 }, generateTicketCode))
    expect(codes.size).toBe(200)
    codes.forEach((c) => expect(c).toMatch(/^TKT-[0-9A-F]{12}$/))
  })

  it('clamps quantity into 1..max', () => {
    expect(clampQuantity(undefined)).toBe(1)
    expect(clampQuantity(-4)).toBe(1)
    expect(clampQuantity('3')).toBe(3)
    expect(clampQuantity(999)).toBe(MAX_TICKETS_PER_ORDER)
  })

  it('enforces capacity only when set', () => {
    expect(remainingCapacity(0, 50)).toBeNull()
    expect(remainingCapacity(undefined, 50)).toBeNull()
    expect(remainingCapacity(100, 40)).toBe(60)
    expect(remainingCapacity(100, 140)).toBe(0)
    expect(canPurchase(100, 98, 2)).toBe(true)
    expect(canPurchase(100, 98, 3)).toBe(false)
    expect(canPurchase(0, 1000, 5)).toBe(true)
  })

  it('builds a CSV and neutralises formula injection', () => {
    const csv = buildAttendeesCsv([
      {
        ticketCode: 'TKT-1',
        buyer: '=HYPERLINK("http://x")',
        quantity: 2,
        totalAmount: '20',
        status: 'paid',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ])
    const [header, row] = csv.split('\r\n')
    expect(header).toContain('"Ticket"')
    expect(row).toContain(`"'=HYPERLINK(""http://x"")"`)
    expect(row).toContain('"2"')
  })
})
