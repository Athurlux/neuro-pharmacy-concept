import commerce from '../../assets-src/pack/data/demo-commerce.json'

export type Fulfilment = 'delivery' | 'collection'

/** Demonstration fees from demo-commerce.json, in whole shillings. Not business pricing. */
export const DEMO_FEES: Record<Fulfilment, number> = {
  delivery: commerce.deliveryFeeDemo,
  collection: commerce.collectionFeeDemo,
}

export const CONFIRMATION_TEXT = commerce.confirmation

const UGX = new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 })

/** "UGX 18,000". Integers only: every price and total in this site is whole shillings. */
export function formatUGX(amount: number) {
  if (!Number.isSafeInteger(amount)) throw new Error(`Not a whole-shilling amount: ${amount}`)
  return `UGX ${UGX.format(amount)}`
}

export const feeFor = (fulfilment: string | null | undefined) =>
  fulfilment === 'delivery' || fulfilment === 'collection' ? DEMO_FEES[fulfilment] : null
