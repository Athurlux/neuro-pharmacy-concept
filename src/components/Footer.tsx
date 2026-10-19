import { Link } from 'react-router'
import { Logo } from './Bits'
import { NAV, SECONDARY } from './Header'

export const PORTFOLIO_URL = 'https://arthur-kitandwe.kranks533.workers.dev/'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Logo tone="ivory" height={44} />
            <p>A proposed website for a neighbourhood pharmacy: find a branch, ask about an item, and try a demo shop with delivery or collection.</p>
          </div>
          <nav className="site-footer__col" aria-label="Footer: shop and services">
            <h2>Explore</h2>
            <ul>{NAV.map(link => <li key={link.to}><Link to={link.to}>{link.label}</Link></li>)}</ul>
          </nav>
          <nav className="site-footer__col" aria-label="Footer: more">
            <h2>More</h2>
            <ul>
              <li><Link to="/basket">Basket</Link></li>
              {SECONDARY.map(link => <li key={link.to}><Link to={link.to}>{link.label}</Link></li>)}
            </ul>
          </nav>
        </div>
        <div className="site-footer__disclosure">
          <p><strong>Independent website concept.</strong> This is an unsolicited proposal, not Neuro Pharmacy’s official website or an ordering service. Neuro Pharmacy has not commissioned or approved it. The branding is a concept proposal.</p>
          <p>Products, prices and fees are fictional. People, premises and deliveries in the photographs are illustrative. Branch details are unconfirmed. Forms send nothing, and no order, payment, reservation or prescription is processed.</p>
          <p className="site-footer__credit">Concept design &amp; development by Arthur Kitandwe. <a href={PORTFOLIO_URL} rel="noopener">View portfolio</a></p>
        </div>
      </div>
    </footer>
  )
}
