import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CATEGORIES, PRODUCTS, categoryLabel, type CategoryId } from '../data/catalogue'
import { SORTS, filterProducts, hasActiveFilters, readFilters, writeFilters, type ShopFilters, type Sort } from '../lib/shopFilters'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { DemoNote, EmptyState, PageIntro } from '../components/Bits'
import { Icon } from '../components/Icon'
import { ProductCard } from '../components/ProductCard'

export default function Shop() {
  useDocumentTitle('Demo shop')
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params)
  const results = filterProducts(filters)
  const [query, setQuery] = useState(filters.q)
  const typing = useRef(false)

  const apply = (next: ShopFilters, replace = false) => setParams(writeFilters(next), { replace, preventScrollReset: true })

  // Typing updates the URL after a pause. The first change adds a history entry; further
  // keystrokes replace it, so Back undoes a whole search rather than one letter.
  useEffect(() => {
    if (query === filters.q) return
    const timer = window.setTimeout(() => {
      apply({ ...filters, q: query }, typing.current)
      typing.current = true
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query, filters.q])

  // Back/Forward (or a chip) can change q underneath the input; follow it.
  useEffect(() => { setQuery(filters.q); typing.current = false }, [filters.q])

  const toggleCategory = (id: CategoryId) => {
    const categories = filters.categories.includes(id) ? filters.categories.filter(item => item !== id) : [...filters.categories, id]
    apply({ ...filters, q: query, categories })
  }

  const chips = [
    ...(filters.q.trim() ? [{ key: 'q', label: `“${filters.q.trim()}”`, remove: () => apply({ ...filters, q: '' }) }] : []),
    ...filters.categories.map(id => ({ key: id, label: categoryLabel(id), remove: () => toggleCategory(id) })),
    ...(filters.sort !== 'featured' ? [{ key: 'sort', label: SORTS.find(sort => sort.value === filters.sort)!.label, remove: () => apply({ ...filters, sort: 'featured' }) }] : []),
  ]

  return (
    <>
      <PageIntro title="Demo shop" aside={<DemoNote>Items, images and prices are fictional demonstrations, not Neuro Pharmacy stock or offers. No payment is ever requested.</DemoNote>}>
        <p>Everyday personal care, oral care, home health and daily essentials. Medicines are not sold here; to ask whether a branch has one, use an <Link to="/enquire/availability">availability enquiry</Link>.</p>
      </PageIntro>

      <div className="container section section--tight shop">
        <form className="shop__controls" role="search" aria-label="Filter the demo shop" onSubmit={event => { event.preventDefault(); apply({ ...filters, q: query }, typing.current) }}>
          <div className="field shop__search">
            <label className="field__label" htmlFor="shop-q">Search</label>
            <span className="input-icon">
              <Icon name="search" size={18} />
              <input id="shop-q" className="input" type="search" value={query} maxLength={60} autoComplete="off" placeholder="Try “toothpaste”" onChange={event => setQuery(event.target.value)} />
            </span>
          </div>
          <fieldset className="shop__categories">
            <legend className="field__label">Category</legend>
            <div className="toggle-row">
              {CATEGORIES.map(category => {
                const on = filters.categories.includes(category.id)
                return (
                  <button key={category.id} type="button" className={`toggle ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggleCategory(category.id)}>
                    {on && <Icon name="check" size={15} />}{category.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <div className="field shop__sort">
            <label className="field__label" htmlFor="shop-sort">Sort by</label>
            <select id="shop-sort" className="input input--select" value={filters.sort} onChange={event => apply({ ...filters, q: query, sort: event.target.value as Sort })}>
              {SORTS.map(sort => <option key={sort.value} value={sort.value}>{sort.label}</option>)}
            </select>
          </div>
        </form>

        <div className="shop__status">
          <p className="shop__count" aria-live="polite">
            {results.length === PRODUCTS.length ? `${PRODUCTS.length} items` : `${results.length} of ${PRODUCTS.length} items`}
          </p>
          {chips.length > 0 && (
            <ul className="chips" aria-label="Active filters">
              {chips.map(chip => (
                <li key={chip.key}>
                  <button type="button" className="chip" onClick={chip.remove}>{chip.label}<Icon name="close" size={14} /><span className="visually-hidden">: remove filter</span></button>
                </li>
              ))}
            </ul>
          )}
          {hasActiveFilters(filters) && <button type="button" className="text-button" onClick={() => { setQuery(''); apply({ q: '', categories: [], sort: 'featured' }) }}>Reset all</button>}
        </div>

        {results.length ? (
          <ul className="product-grid product-grid--shop">
            {results.map(product => <li key={product.id}><ProductCard product={product} headingLevel={2} /></li>)}
          </ul>
        ) : (
          <EmptyState art="no-results" title="No items match these filters"
            actions={<button type="button" className="button button--primary" onClick={() => { setQuery(''); apply({ q: '', categories: [], sort: 'featured' }) }}>Reset filters</button>}>
            <p>Try a shorter search or remove a category. Looking for a medicine? Medicines aren’t listed in this demo shop, but you can <Link to="/enquire/availability">ask a branch whether it’s available</Link>.</p>
          </EmptyState>
        )}
      </div>
    </>
  )
}
