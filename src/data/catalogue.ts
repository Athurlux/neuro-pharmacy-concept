import catalogue from '../../assets-src/pack/data/demo-catalogue.json'

// The eight demo items come straight from the asset pack's demo-catalogue.json, so IDs,
// names, categories and prices have one source. Everything here is fictional: no stock,
// brand, size, ingredient, suitability or accuracy claim is made or implied.

export type CategoryId = 'personal-care' | 'oral-care' | 'home-health' | 'daily-essentials'

export interface Product {
  id: string
  /** URL slug, e.g. "lotion" for product-lotion. */
  slug: string
  name: string
  category: CategoryId
  /** Whole Uganda shillings. */
  price: number
  /** Short, neutral description of what the photograph shows. */
  description: string
  alt: string
}

export const CATEGORIES: { id: CategoryId; label: string; blurb: string }[] = [
  { id: 'personal-care', label: 'Personal care', blurb: 'Lotion, handwash and soap' },
  { id: 'oral-care', label: 'Oral care', blurb: 'Toothbrush and toothpaste' },
  { id: 'home-health', label: 'Home health', blurb: 'Thermometer and an empty first aid pouch' },
  { id: 'daily-essentials', label: 'Daily essentials', blurb: 'Pocket tissues' },
]

// Descriptions say what is pictured and stop there. The packaging in the photographs is
// deliberately unlabelled, so nothing about contents, size or maker is stated.
const COPY: Record<string, { description: string; alt: string }> = {
  'product-lotion': {
    description: 'A plain body lotion bottle for everyday skin care. Size, ingredients and maker are not part of this demo.',
    alt: 'Cream-coloured lotion bottle with a blank mint label',
  },
  'product-handwash': {
    description: 'A pump-top handwash bottle for the bathroom or kitchen sink. Contents and volume are not part of this demo.',
    alt: 'Clear pump bottle of pale aqua handwash with a blank label',
  },
  'product-soap': {
    description: 'A single bar of soap with its plain carton. Ingredients and weight are not part of this demo.',
    alt: 'Cream soap bar resting against a plain sage-green carton',
  },
  'product-toothbrush': {
    description: 'A manual toothbrush with a teal and white handle. Bristle type is not part of this demo.',
    alt: 'Teal and white manual toothbrush on a light background',
  },
  'product-toothpaste': {
    description: 'A plain white toothpaste tube. Formulation and tube size are not part of this demo.',
    alt: 'White toothpaste tube with a mint band and no printed text',
  },
  'product-thermometer': {
    description: 'A digital thermometer with its clear storage case, shown with a blank display. Accuracy and specifications are not part of this demo.',
    alt: 'White digital thermometer with a teal button beside a clear plastic case',
  },
  'product-first-aid-pouch': {
    description: 'A zipped teal storage pouch for keeping your own first aid supplies together. It is sold empty; no supplies are included.',
    alt: 'Empty teal zipped pouch with a white cross on the front',
  },
  'product-tissues': {
    description: 'A soft pack of pocket tissues for a bag or car. Sheet count is not part of this demo.',
    alt: 'Mint-green pocket tissue pack with a tissue pulled up',
  },
}

const CATEGORY_IDS = CATEGORIES.map(category => category.id) as string[]

export const PRODUCTS: Product[] = catalogue.items.map(item => {
  if (!CATEGORY_IDS.includes(item.category) || !Number.isInteger(item.demoPrice) || !COPY[item.id]) {
    throw new Error(`Catalogue item ${item.id} is incomplete`)
  }
  return {
    id: item.id,
    slug: item.id.replace(/^product-/, ''),
    name: item.name,
    category: item.category as CategoryId,
    price: item.demoPrice,
    ...COPY[item.id],
  }
})

export const findProduct = (id: string | null | undefined) => PRODUCTS.find(product => product.id === id)
export const findProductBySlug = (slug: string | undefined) => PRODUCTS.find(product => product.slug === slug)
export const categoryLabel = (id: CategoryId) => CATEGORIES.find(category => category.id === id)?.label ?? id

/** Other items in the same category first, then the rest, for "you might also add". */
export function relatedProducts(product: Product, limit = 3) {
  const others = PRODUCTS.filter(candidate => candidate.id !== product.id)
  return [...others.filter(item => item.category === product.category), ...others.filter(item => item.category !== product.category)].slice(0, limit)
}
