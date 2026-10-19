import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useFocusTrap, useScrollLock } from '../lib/useFocusTrap'
import { priceBasket, useBasket } from '../lib/basket'
import { formatUGX } from '../data/commerce'
import { Icon } from './Icon'
import { EmptyState, Logo } from './Bits'
import { BasketLines } from './BasketParts'

export const NAV = [
  { to: '/shop', label: 'Shop' },
  { to: '/delivery', label: 'Delivery' },
  { to: '/branches', label: 'Branches' },
  { to: '/enquire/availability', label: 'Ask about an item' },
  { to: '/enquire/pharmacist', label: 'Contact a pharmacist' },
]

export const SECONDARY = [
  { to: '/prescriptions', label: 'Prescription process (demo)' },
  { to: '/about', label: 'About this concept' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const totals = priceBasket(useBasket())
  const count = totals.itemCount
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const closePanel = useCallback(() => setPanelOpen(false), [])

  useFocusTrap(barRef, menuOpen, closeMenu)
  useFocusTrap(panelRef, panelOpen, closePanel)
  useScrollLock(menuOpen || panelOpen)
  useEffect(() => { setMenuOpen(false); setPanelOpen(false) }, [pathname])

  return (
    <>
      <header className={`site-header ${menuOpen ? 'is-menu' : ''}`}>
        <div ref={barRef}>
          <div className="container site-header__inner">
            <div className="site-header__brand">
              <Link to="/" className="site-header__logo" aria-label="Neuro Pharmacy concept, home"><Logo height={38} /></Link>
              <Link to="/about#concept" className="concept-tag">Independent website concept</Link>
            </div>

            <nav className="site-nav" aria-label="Main">
              <ul>{NAV.map(link => <li key={link.to}><NavLink to={link.to}>{link.label}</NavLink></li>)}</ul>
            </nav>

            <div className="site-header__actions">
              <button type="button" className="basket-toggle" aria-haspopup="dialog" aria-expanded={panelOpen} onClick={() => setPanelOpen(true)}
                aria-label={`Basket, ${count} ${count === 1 ? 'item' : 'items'}`}>
                <Icon name="basket" size={22} />
                <span className="basket-toggle__label">Basket</span>
                {/* Keyed by count so the badge replays its short pop on every change. */}
                <span key={count} className={`count ${count ? 'is-filled' : ''}`} aria-hidden="true">{count}</span>
              </button>
              <button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(open => !open)}>
                <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
              </button>
            </div>
          </div>

          <div id="mobile-menu" className="mobile-menu" hidden={!menuOpen}>
            <nav aria-label="Mobile">
              <ul className="mobile-menu__primary">
                <li><NavLink to="/" end data-autofocus>Home</NavLink></li>
                {NAV.map(link => <li key={link.to}><NavLink to={link.to}>{link.label}</NavLink></li>)}
                <li><NavLink to="/basket">Basket ({count})</NavLink></li>
              </ul>
              <ul className="mobile-menu__secondary">
                {SECONDARY.map(link => <li key={link.to}><Link to={link.to}>{link.label}</Link></li>)}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Rendered only while open, so the page never holds a second, hidden copy of the list. */}
      {panelOpen && (
        <div className="drawer">
          <button type="button" className="drawer__scrim" tabIndex={-1} aria-hidden="true" onClick={closePanel} />
          <div ref={panelRef} className="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
            <div className="drawer__head">
              <h2 id="drawer-title">Your basket</h2>
              <button type="button" className="icon-button" aria-label="Close basket" onClick={closePanel} data-autofocus><Icon name="close" size={22} /></button>
            </div>
            {count ? (
              <>
                <div className="drawer__body"><BasketLines compact onNavigate={closePanel} /></div>
                <div className="drawer__foot">
                  <p className="drawer__subtotal"><span>Subtotal</span><strong>{formatUGX(totals.subtotal)}</strong></p>
                  <p className="fine-print">Fictional demo prices. Delivery or collection is chosen at checkout.</p>
                  <Link to="/checkout" className="button button--primary button--block" onClick={closePanel}>Go to demo checkout</Link>
                  <div className="drawer__links">
                    <Link to="/basket" onClick={closePanel}>View full basket</Link>
                    <button type="button" className="text-button" onClick={closePanel}>Continue shopping</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="drawer__body">
                <EmptyState art="empty-basket" title="Your basket is empty" actions={<Link to="/shop" className="button button--primary" onClick={closePanel}>Explore the demo shop</Link>}>
                  <p>Add everyday essentials from the demo shop to try the delivery or collection journey.</p>
                </EmptyState>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
