import { useSyncExternalStore } from 'react'
import { findProduct, type Product } from '../data/catalogue'
import { feeFor } from '../data/commerce'

// The demo basket: the only thing this site keeps between visits. It stores product IDs
// and whole quantities and nothing else: no names, prices, contact or enquiry details.
// Prices are looked up from the catalogue at read time, so totals can never go stale.

export const STORAGE_KEY = 'neuro-concept-basket'
const VERSION = 1
export const MAX_QTY = 20

export interface Line {
  id: string
  qty: number
}

export type Basket = Line[]

export const EMPTY: Basket = []

const clampQty = (value: unknown) => {
  const number = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 1
  return Math.min(MAX_QTY, Math.max(1, number))
}

/**
 * Reads stored data defensively. Malformed JSON, another version, unknown or retired
 * product IDs and odd quantities are dropped or repaired instead of breaking the page,
 * and duplicate IDs are merged into one line.
 */
export function parseBasket(raw: string | null): Basket {
  if (!raw) return EMPTY
  try {
    const value = JSON.parse(raw) as { version?: unknown; items?: unknown }
    if (!value || value.version !== VERSION || !Array.isArray(value.items)) return EMPTY
    let basket: Basket = EMPTY
    for (const entry of value.items as { id?: unknown; qty?: unknown }[]) {
      if (!entry || typeof entry.id !== 'string' || !findProduct(entry.id)) continue
      basket = addProduct(basket, entry.id, clampQty(entry.qty)).basket
    }
    return basket
  } catch {
    return EMPTY
  }
}

export const serializeBasket = (basket: Basket) => JSON.stringify({ version: VERSION, items: basket.map(({ id, qty }) => ({ id, qty })) })

/** Adding an item already in the basket merges into its line, capped at MAX_QTY. */
export function addProduct(basket: Basket, id: string, qty = 1): { basket: Basket; added: number } {
  if (!findProduct(id)) return { basket, added: 0 }
  const amount = clampQty(qty)
  const existing = basket.find(line => line.id === id)
  if (!existing) return { basket: [...basket, { id, qty: amount }], added: amount }
  const next = Math.min(MAX_QTY, existing.qty + amount)
  return { basket: basket.map(line => (line.id === id ? { id, qty: next } : line)), added: next - existing.qty }
}

/** A quantity below one removes the line; above the cap it is held at the cap. */
export function setQuantity(basket: Basket, id: string, qty: number): Basket {
  if (!Number.isFinite(qty) || qty < 1) return removeProduct(basket, id)
  return basket.map(line => (line.id === id ? { id, qty: clampQty(qty) } : line))
}

export const removeProduct = (basket: Basket, id: string): Basket => basket.filter(line => line.id !== id)

export interface PricedLine {
  product: Product
  qty: number
  lineTotal: number
}

export interface Totals {
  lines: PricedLine[]
  itemCount: number
  subtotal: number
  fee: number | null
  total: number | null
}

/** Integer arithmetic throughout. The fee is null until a fulfilment choice exists. */
export function priceBasket(basket: Basket, fulfilment?: string | null): Totals {
  const lines = basket.flatMap(line => {
    const product = findProduct(line.id)
    return product ? [{ product, qty: line.qty, lineTotal: product.price * line.qty }] : []
  })
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const fee = feeFor(fulfilment)
  return {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.qty, 0),
    subtotal,
    fee,
    total: fee === null ? null : subtotal + fee,
  }
}

// ---- Store -------------------------------------------------------------------------

let current: Basket = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function read() {
  if (!loaded) {
    loaded = true
    try { current = parseBasket(localStorage.getItem(STORAGE_KEY)) } catch { current = EMPTY }
  }
  return current
}

function commit(next: Basket) {
  current = next
  try {
    if (next.length) localStorage.setItem(STORAGE_KEY, serializeBasket(next))
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* storage unavailable: the basket still works for this visit */ }
  listeners.forEach(listener => listener())
}

export const basket = {
  snapshot: () => read(),
  /** Returns how many were actually added (0 when already at the cap). */
  add(id: string, qty = 1) {
    const result = addProduct(read(), id, qty)
    commit(result.basket)
    return { added: result.added, qty: result.basket.find(line => line.id === id)?.qty ?? 0 }
  },
  setQuantity: (id: string, qty: number) => commit(setQuantity(read(), id, qty)),
  remove: (id: string) => commit(removeProduct(read(), id)),
  clear: () => commit(EMPTY),
  /** Puts back lines removed a moment ago (the "Undo" after Clear or Remove). */
  restore: (lines: Basket) => commit(lines.reduce((acc, line) => addProduct(acc, line.id, line.qty).basket, read())),
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Other tabs write the same key; keep this one in step.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    current = parseBasket(event.newValue)
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage) }
}

export const useBasket = () => useSyncExternalStore(subscribe, read, () => EMPTY)
