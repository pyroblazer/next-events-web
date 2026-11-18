import { escapeRegExp, formUrlQuery } from '@/lib/utils'
import { eventFormSchema } from '@/lib/validator'

describe('escapeRegExp', () => {
  it('escapes regex metacharacters so user input is matched literally', () => {
    const escaped = escapeRegExp('a.b*(c)')
    expect(new RegExp(escaped).test('a.b*(c)')).toBe(true)
    expect(new RegExp(escaped).test('aXbbb(c)')).toBe(false)
  })

  it('neutralises catastrophic patterns', () => {
    expect(() => new RegExp(escapeRegExp('(a+)+$'))).not.toThrow()
  })
})

describe('formUrlQuery', () => {
  it('sets a query param while keeping existing ones', () => {
    const url = formUrlQuery({ params: 'page=2', key: 'query', value: 'party' })
    expect(url).toContain('page=2')
    expect(url).toContain('query=party')
  })
})

describe('eventFormSchema', () => {
  const valid = {
    title: 'Birthday',
    description: 'A nice party',
    location: 'Jakarta',
    imageUrl: 'https://utfs.io/f/x.png',
    startDateTime: new Date(),
    endDateTime: new Date(),
    categoryId: 'abc',
    price: '10',
    isFree: false,
    url: 'https://example.com',
  }

  it('accepts a valid event', () => {
    expect(eventFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects short titles and invalid urls', () => {
    expect(eventFormSchema.safeParse({ ...valid, title: 'ab' }).success).toBe(false)
    expect(eventFormSchema.safeParse({ ...valid, url: 'nope' }).success).toBe(false)
  })
})
