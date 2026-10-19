import { CATEGORIES, PRODUCTS, type CategoryId, type Product } from '../data/catalogue'

// Search, category and sort live in the URL (?q=&category=&sort=), so refresh, sharing
// and the browser's Back button all reproduce the same list.

export const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
] as const

export type Sort = (typeof SORTS)[number]['value']

export interface ShopFilters {
  q: string
  categories: CategoryId[]
  sort: Sort
}

const isCategory = (value: string): value is CategoryId => CATEGORIES.some(category => category.id === value)
const isSort = (value: string | null): value is Sort => SORTS.some(sort => sort.value === value)

/** Unknown categories and sorts are ignored rather than producing an empty page. */
export function readFilters(params: URLSearchParams): ShopFilters {
  const categories = [...new Set(params.getAll('category').filter(isCategory))]
  const sort = params.get('sort')
  return { q: (params.get('q') ?? '').slice(0, 60), categories, sort: isSort(sort) ? sort : 'featured' }
}

export function writeFilters(filters: ShopFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q.trim()) params.set('q', filters.q)
  // Keep catalogue order so the same selection always yields the same URL.
  for (const category of CATEGORIES) if (filters.categories.includes(category.id)) params.append('category', category.id)
  if (filters.sort !== 'featured') params.set('sort', filters.sort)
  return params
}

const normalise = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ')

/** Every word typed must appear in the name, category or description. */
export function matches(product: Product, q: string) {
  const words = normalise(q).split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const category = CATEGORIES.find(item => item.id === product.category)?.label ?? ''
  const haystack = normalise(`${product.name} ${category} ${product.description}`)
  return words.every(word => haystack.includes(word))
}

export function filterProducts(filters: ShopFilters, products: Product[] = PRODUCTS): Product[] {
  const found = products.filter(product =>
    (!filters.categories.length || filters.categories.includes(product.category)) && matches(product, filters.q))
  const sorted = [...found]
  if (filters.sort === 'price-asc') sorted.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name))
  if (filters.sort === 'price-desc') sorted.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name))
  if (filters.sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
  return sorted
}

export const hasActiveFilters = (filters: ShopFilters) => Boolean(filters.q.trim() || filters.categories.length || filters.sort !== 'featured')
