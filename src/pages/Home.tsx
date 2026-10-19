import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSiteMotion } from '../animation/useSiteMotion'
import { BRANCHES, BRANCH_OPTIONS, STATUS_LABEL } from '../data/branches'
import { CATEGORIES, PRODUCTS, findProduct } from '../data/catalogue'
import { useForms } from '../forms/FormsContext'
import { availabilityFlow } from '../forms/flows'
import { setPreferredBranch, usePreferredBranch } from '../lib/preferredBranch'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { Icon } from '../components/Icon'
import { ProductImg, SceneImg } from '../components/Img'
import { ProductCard } from '../components/ProductCard'

const FEATURED = ['product-lotion', 'product-toothbrush', 'product-thermometer', 'product-handwash'].map(id => findProduct(id)!)

export default function Home() {
  useDocumentTitle(null)
  const root = useRef<HTMLDivElement>(null)
  useSiteMotion(root)

  return (
    <div ref={root}>
      <section className="hero" aria-labelledby="hero-title">
        <picture className="hero__media">
          <source media="(min-width: 768px)" srcSet="/images/home-hero-desktop-768.webp 768w, /images/home-hero-desktop-1536.webp 1536w" sizes="100vw" width={1536} height={1024} />
          <img data-hero="photo" src="/images/home-hero-mobile-800.webp" srcSet="/images/home-hero-mobile-480.webp 480w, /images/home-hero-mobile-800.webp 800w, /images/home-hero-mobile-1024.webp 1024w" sizes="100vw"
            width={1024} height={512} alt="A smiling pharmacist talks with a customer across a bright pharmacy counter (illustrative image)." fetchPriority="high" decoding="async" />
        </picture>
        <div className="container hero__inner">
          <div className="hero__copy">
            <h1 id="hero-title" className="hero__title">
              <span className="line"><span data-hero="line">Your neighbourhood pharmacy.</span></span>
              <span className="line"><span data-hero="line">A clearer way to connect.</span></span>
            </h1>
            <p className="hero__lede" data-hero="lede">Find a branch, ask whether an item is available, or browse everyday essentials and try delivery or collection in a demo shop.</p>
            <div className="hero__actions">
              <Link to="/branches" className="button button--primary"><Icon name="branch" size={19} /> Find a branch</Link>
              <Link to="/enquire/availability" className="button button--outline"><Icon name="chat" size={19} /> Ask about an item</Link>
              <Link to="/shop" className="button button--outline"><Icon name="basket" size={19} /> Shop everyday essentials</Link>
            </div>
            <Link to="/delivery" className="hero__delivery-link"><Icon name="delivery" size={19} /> See how delivery would work</Link>
          </div>
        </div>
      </section>

      <QuickEnquiry />

      <section className="section" aria-labelledby="categories-title">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title" id="categories-title">Everyday essentials</h2>
            <p>Eight demo items across four aisles. Prices are fictional and nothing is really for sale.</p>
          </div>
          <ul className="category-grid">
            {CATEGORIES.map(category => {
              const items = PRODUCTS.filter(product => product.category === category.id)
              return (
                <li key={category.id} className={`category-tile category-tile--${category.id}`} data-anim="card">
                  <Link to={`/shop?category=${category.id}`}>
                    <span className="category-tile__media">
                      {category.id === 'personal-care'
                        ? <SceneImg name="category-personal-care" sizes="(min-width: 1024px) 45vw, 100vw" alt="" />
                        : <ProductImg product={items[0]} sizes="(min-width: 1024px) 22vw, 50vw" alt="" />}
                    </span>
                    <span className="category-tile__text">
                      <span className="category-tile__name">{category.label}</span>
                      <span className="category-tile__blurb">{category.blurb}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="section section--mint" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-head section-head--row">
            <div>
              <h2 className="section-title" id="featured-title">From the demo shop</h2>
              <p>Add items, change quantities, then choose delivery or collection at checkout.</p>
            </div>
            <Link to="/shop" className="text-link">See all {PRODUCTS.length} items</Link>
          </div>
          <ul className="product-grid">
            {FEATURED.map(product => <li key={product.id} data-anim="card"><ProductCard product={product} /></li>)}
          </ul>
        </div>
      </section>

      <section className="section journey" aria-labelledby="journey-title">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title" id="journey-title">Delivery or collection, your choice</h2>
            <p>A proposed way to order everyday items. The steps below are a working demo; no real orders, coverage or arrival times are offered.</p>
          </div>
          <div className="journey__layout" data-story>
            <div className="journey__stage" aria-hidden="true">
              <SceneImg name="category-personal-care" sizes="45vw" alt="" className="journey__frame" data-frame="1" />
              <SceneImg name="delivery-handover" sizes="45vw" alt="" className="journey__frame" data-frame="2" />
              <SceneImg name="collection-counter" sizes="45vw" alt="" className="journey__frame" data-frame="3" />
            </div>
            <ol className="journey__steps">
              <li data-step="1">
                <span className="journey__num" aria-hidden="true">1</span>
                <h3>Choose essentials</h3>
                <p>Browse personal care, oral care, home health and daily essentials. Search, filter and sort as you go.</p>
                <SceneImg name="category-personal-care" sizes="100vw" alt="Lotion, handwash, soap and a toothbrush arranged on a bathroom shelf (illustrative image)." className="journey__inline" />
              </li>
              <li data-step="2">
                <span className="journey__num" aria-hidden="true">2</span>
                <h3>Choose delivery or collection</h3>
                <p>Have items brought to your door for a demo fee, or collect from a branch you choose. Either way, nothing is reserved.</p>
                <SceneImg name="delivery-handover" sizes="100vw" alt="A rider in teal hands a pharmacy bag to a customer at her gate (illustrative image)." className="journey__inline" />
              </li>
              <li data-step="3">
                <span className="journey__num" aria-hidden="true">3</span>
                <h3>Review your request</h3>
                <p>Check items, totals and details, edit anything, then complete the demo. You get a reference and a printable summary.</p>
                <SceneImg name="collection-counter" sizes="100vw" alt="A pharmacist hands a customer a bag across the counter (illustrative image)." className="journey__inline" />
              </li>
            </ol>
          </div>
          <div className="button-row journey__cta">
            <Link to="/delivery" className="button button--primary">How delivery would work</Link>
            <Link to="/shop" className="button button--ghost">Start in the demo shop</Link>
          </div>
        </div>
      </section>

      <section className="section section--deep" aria-labelledby="branches-title">
        <div className="container branches-teaser">
          <div>
            <h2 className="section-title" id="branches-title">Find a branch</h2>
            <p>Public listings point to several Neuro Pharmacy locations around north and east Kampala. Until the business confirms them, this concept shows each one with what is known and what still needs checking.</p>
            <Link to="/branches" className="button button--light">Open the branch directory</Link>
          </div>
          <ul className="branch-chips">
            {BRANCHES.map(branch => (
              <li key={branch.slug}>
                <Link to={`/branches/${branch.slug}`}>
                  <Icon name="branch" size={18} />
                  <span><strong>{branch.name}</strong><small>{STATUS_LABEL[branch.status]}</small></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="pharmacist-title">
        <div className="container split">
          <figure className="split__media" data-anim="scene">
            <SceneImg name="pharmacist-conversation" sizes="(min-width: 900px) 50vw, 100vw" alt="A pharmacist talks with an older customer at a consultation desk (illustrative image)." />
          </figure>
          <div className="split__text">
            <h2 className="section-title" id="pharmacist-title">Questions for a pharmacist</h2>
            <p>Send a short note about a shop item, a medicine you already have, or what a branch can help with, and say how you’d like a reply. The request goes to a person, not an automated answer.</p>
            <p className="muted">In this concept nothing is sent and no advice is given. For urgent symptoms, contact a health facility directly.</p>
            <div className="button-row">
              <Link to="/enquire/pharmacist" className="button button--primary">Contact a pharmacist</Link>
              <Link to="/prescriptions" className="button button--ghost">See the prescription process</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-title">
        <div className="container closing__inner">
          <h2 id="closing-title">Start with what you need.</h2>
          <div className="button-row">
            <Link to="/branches" className="button button--light">Find a branch</Link>
            <Link to="/enquire/availability" className="button button--on-dark">Ask about an item</Link>
            <Link to="/shop" className="button button--on-dark">Explore the demo shop</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * The counter ledge: branch + item, carried into the full enquiry in memory (never the URL
 * or storage), so a medicine name does not end up in history or logs.
 */
function QuickEnquiry() {
  const navigate = useNavigate()
  const { drafts, setDraft } = useForms()
  const preferred = usePreferredBranch()
  const [branch, setBranch] = useState(preferred ?? '')
  const [item, setItem] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!item.trim()) { setError('Enter the item you’re looking for.'); document.getElementById('quick-item')?.focus(); return }
    const existing = drafts[availabilityFlow.key] ?? availabilityFlow.empty()
    setDraft(availabilityFlow.key, { ...existing, item: item.trim().slice(0, 80), branch: branch || existing.branch })
    if (branch) setPreferredBranch(branch)
    navigate('/enquire/availability')
  }

  return (
    <div className="container ledge-wrap">
      <form className="ledge" data-hero="ledge" onSubmit={submit} noValidate aria-labelledby="ledge-title">
        <h2 className="ledge__title" id="ledge-title">Ask a branch about an item</h2>
        <div className="ledge__fields">
          <div className="field">
            <label className="field__label" htmlFor="quick-branch">Branch</label>
            <select id="quick-branch" className="input input--select" value={branch} onChange={event => setBranch(event.target.value)}>
              <option value="">Choose later</option>
              {BRANCH_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className={`field ${error ? 'is-invalid' : ''}`}>
            <label className="field__label" htmlFor="quick-item">Item</label>
            <input id="quick-item" className="input" value={item} maxLength={80} autoComplete="off" placeholder="Name of the item"
              aria-invalid={error ? true : undefined} aria-describedby={error ? 'quick-item-error' : undefined}
              onChange={event => { setItem(event.target.value); if (error) setError(null) }} />
            {error && <p className="field__error" id="quick-item-error">{error}</p>}
          </div>
          <button type="submit" className="button button--primary ledge__submit">Continue to enquiry</button>
        </div>
        <p className="ledge__note">Demo only. A real branch would confirm availability; nothing here checks stock.</p>
      </form>
    </div>
  )
}
