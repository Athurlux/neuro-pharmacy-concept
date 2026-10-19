import { describe, expect, it } from 'vitest'
import { addProduct, parseBasket, priceBasket, removeProduct, serializeBasket, setQuantity, MAX_QTY } from './basket'
import { filterProducts, readFilters, writeFilters } from './shopFilters'
import { normalizePhone } from './validation'
import { DEMO_FEES, formatUGX } from '../data/commerce'
import { PRODUCTS } from '../data/catalogue'
import { activeStages, firstIncompleteIndex, reviewSections, validateStage } from '../forms/engine'
import { checkoutFlow, availabilityFlow, prescriptionFlow, DEMO_DOCUMENT } from '../forms/flows'
import { resolveStep } from '../forms/useFormFlow'

describe('basket arithmetic and merging', () => {
  it('merges repeat adds into one line and caps the quantity', () => {
    let basket = addProduct([], 'product-soap').basket
    basket = addProduct(basket, 'product-soap', 2).basket
    expect(basket).toEqual([{ id: 'product-soap', qty: 3 }])
    const capped = addProduct(basket, 'product-soap', 50)
    expect(capped.basket[0].qty).toBe(MAX_QTY)
    expect(capped.added).toBe(MAX_QTY - 3)
    expect(addProduct(capped.basket, 'product-soap').added).toBe(0)
  })

  it('ignores unknown products', () => {
    expect(addProduct([], 'product-aspirin')).toEqual({ basket: [], added: 0 })
  })

  it('removes a line when quantity drops below one', () => {
    const basket = [{ id: 'product-soap', qty: 1 }, { id: 'product-tissues', qty: 2 }]
    expect(setQuantity(basket, 'product-soap', 0)).toEqual([{ id: 'product-tissues', qty: 2 }])
    expect(setQuantity(basket, 'product-tissues', 3.6)).toEqual([{ id: 'product-soap', qty: 1 }, { id: 'product-tissues', qty: 4 }])
    expect(removeProduct(basket, 'product-tissues')).toEqual([{ id: 'product-soap', qty: 1 }])
  })

  it('prices lines, subtotal and the demo fee as whole shillings', () => {
    const basket = [{ id: 'product-lotion', qty: 2 }, { id: 'product-tissues', qty: 3 }]
    const none = priceBasket(basket)
    expect(none.subtotal).toBe(2 * 18000 + 3 * 3000)
    expect(none.itemCount).toBe(5)
    expect(none.fee).toBeNull()
    expect(none.total).toBeNull()
    expect(priceBasket(basket, 'delivery').total).toBe(45000 + DEMO_FEES.delivery)
    expect(priceBasket(basket, 'collection').total).toBe(45000)
    expect(DEMO_FEES).toEqual({ delivery: 5000, collection: 0 })
    expect(formatUGX(45000)).toBe('UGX 45,000')
    expect(() => formatUGX(0.5)).toThrow()
  })
})

describe('basket storage recovery', () => {
  it('round-trips IDs and quantities only', () => {
    const raw = serializeBasket([{ id: 'product-soap', qty: 2 }])
    expect(JSON.parse(raw)).toEqual({ version: 1, items: [{ id: 'product-soap', qty: 2 }] })
    expect(parseBasket(raw)).toEqual([{ id: 'product-soap', qty: 2 }])
  })

  it('recovers from corrupt, outdated or tampered data', () => {
    expect(parseBasket('{not json')).toEqual([])
    expect(parseBasket(JSON.stringify({ version: 0, items: [{ id: 'product-soap', qty: 1 }] }))).toEqual([])
    expect(parseBasket(JSON.stringify({ version: 1, items: 'nope' }))).toEqual([])
    const messy = JSON.stringify({
      version: 1,
      items: [{ id: 'product-soap', qty: 2 }, { id: 'retired-item', qty: 1 }, null, { id: 'product-soap', qty: 3 }, { id: 'product-lotion', qty: -4 }, { id: 'product-tissues', qty: 900 }, { id: 'product-handwash', qty: 'x' }],
    })
    expect(parseBasket(messy)).toEqual([
      { id: 'product-soap', qty: 5 },
      { id: 'product-lotion', qty: 1 },
      { id: 'product-tissues', qty: MAX_QTY },
      { id: 'product-handwash', qty: 1 },
    ])
  })
})

describe('shop filters', () => {
  it('reads only known values and writes a stable URL', () => {
    const filters = readFilters(new URLSearchParams('category=oral-care&category=bogus&category=personal-care&sort=weird&q=tooth'))
    expect(filters).toEqual({ q: 'tooth', categories: ['oral-care', 'personal-care'], sort: 'featured' })
    expect(writeFilters(filters).toString()).toBe('q=tooth&category=personal-care&category=oral-care')
  })

  it('searches every word and sorts by price or name', () => {
    expect(filterProducts({ q: 'TOOTH', categories: [], sort: 'featured' }).map(p => p.id)).toEqual(['product-toothbrush', 'product-toothpaste'])
    expect(filterProducts({ q: 'first aid pouch', categories: [], sort: 'featured' }).map(p => p.id)).toEqual(['product-first-aid-pouch'])
    expect(filterProducts({ q: 'aspirin', categories: [], sort: 'featured' })).toEqual([])
    const cheapest = filterProducts({ q: '', categories: [], sort: 'price-asc' })
    expect(cheapest[0].id).toBe('product-tissues')
    expect(cheapest.map(p => p.price)).toEqual([...PRODUCTS.map(p => p.price)].sort((a, b) => a - b))
    expect(filterProducts({ q: '', categories: ['home-health'], sort: 'price-desc' }).map(p => p.id)).toEqual(['product-thermometer', 'product-first-aid-pouch'])
  })
})

describe('validation', () => {
  it('accepts Ugandan and international numbers without a rigid pattern', () => {
    expect(normalizePhone('0772 123 456')).toBe('+256772123456')
    expect(normalizePhone('+256 (0)772-123456')).toBeNull()
    expect(normalizePhone('+256 772-123-456')).toBe('+256772123456')
    expect(normalizePhone('+44 20 7946 0958')).toBe('+442079460958')
    expect(normalizePhone('12345')).toBeNull()
  })

  it('requires the contact detail that matches the chosen reply method', () => {
    const stage = availabilityFlow.stages[1]
    const base = { ...availabilityFlow.empty(), name: 'Sam' }
    expect(validateStage(stage, { ...base, method: 'email' })).toHaveProperty('email')
    expect(validateStage(stage, { ...base, method: 'sms' })).toHaveProperty('phone')
    expect(validateStage(stage, { ...base, method: 'sms', phone: '0700 123 456' })).toEqual({})
    expect(validateStage(stage, { ...base, method: 'sms', phone: '07001' })).toHaveProperty('phone')
  })
})

describe('checkout steps', () => {
  const ready = { ...checkoutFlow.empty(), branch: 'kyanja', name: 'Sam', phone: '0700 123 456' }

  it('skips the address step for collection and requires it for delivery', () => {
    expect(activeStages(checkoutFlow, { ...ready, fulfilment: 'collection' }).map(s => s.id)).toEqual(['fulfilment', 'details'])
    expect(firstIncompleteIndex(checkoutFlow, { ...ready, fulfilment: 'collection' })).toBe(2) // review
    const delivery = { ...ready, fulfilment: 'delivery' }
    expect(activeStages(checkoutFlow, delivery).map(s => s.id)).toEqual(['fulfilment', 'details', 'address'])
    expect(resolveStep(checkoutFlow, delivery, 'review')).toBe('address')
    expect(resolveStep(checkoutFlow, { ...delivery, address: 'Plot 1', locality: 'Kyanja' }, 'review')).toBe('review')
  })

  it('cannot skip ahead by URL and drops address answers once collection is chosen', () => {
    expect(resolveStep(checkoutFlow, checkoutFlow.empty(), 'review')).toBe('fulfilment')
    const switched = { ...ready, fulfilment: 'collection', address: 'Plot 1', locality: 'Kyanja' }
    const reviewed = reviewSections(checkoutFlow, switched).flatMap(section => section.entries.map(entry => entry.name))
    expect(reviewed).not.toContain('address')
  })

  it('accepts only the fictional sample in the prescription walk-through', () => {
    const stage = prescriptionFlow.stages[0]
    expect(validateStage(stage, { ...prescriptionFlow.empty(), document: 'my-scan.pdf' })).toHaveProperty('document')
    expect(validateStage(stage, { ...prescriptionFlow.empty(), document: DEMO_DOCUMENT })).toEqual({})
  })
})
