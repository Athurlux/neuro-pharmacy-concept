import { Link } from 'react-router'
import { basket, MAX_QTY, priceBasket, useBasket, type Totals } from '../lib/basket'
import { formatUGX } from '../data/commerce'
import { announce } from './Announcer'
import { Icon } from './Icon'
import { ProductImg } from './Img'

export function QtyStepper({ id, name, qty }: { id: string; name: string; qty: number }) {
  return (
    <div className="qty" role="group" aria-label={`Quantity of ${name}`}>
      <button type="button" className="qty__btn" onClick={() => { basket.setQuantity(id, qty - 1); announce(qty - 1 ? `${name}: ${qty - 1}` : `${name} removed from your basket`) }}
        aria-label={qty === 1 ? `Remove ${name}` : `One fewer ${name}`}>
        <Icon name={qty === 1 ? 'trash' : 'minus'} size={16} />
      </button>
      <span className="qty__value" aria-live="polite">{qty}</span>
      <button type="button" className="qty__btn" disabled={qty >= MAX_QTY} onClick={() => { basket.setQuantity(id, qty + 1); announce(`${name}: ${qty + 1}`) }} aria-label={`One more ${name}`}>
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

/** Editable basket lines, used by the slide-out panel and the basket page. */
export function BasketLines({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const { lines } = priceBasket(useBasket())
  return (
    <ul className={`basket-lines ${compact ? 'basket-lines--compact' : ''}`}>
      {lines.map(({ product, qty, lineTotal }) => (
        <li key={product.id} className="basket-line">
          <Link to={`/shop/${product.slug}`} className="basket-line__image" onClick={onNavigate} tabIndex={-1} aria-hidden="true">
            <ProductImg product={product} sizes="96px" alt="" />
          </Link>
          <div className="basket-line__text">
            <Link to={`/shop/${product.slug}`} className="basket-line__name" onClick={onNavigate}>{product.name}</Link>
            <span className="basket-line__unit">{formatUGX(product.price)} each</span>
            <QtyStepper id={product.id} name={product.name} qty={qty} />
          </div>
          <div className="basket-line__end">
            <span className="basket-line__total">{formatUGX(lineTotal)}</span>
            {!compact && <button type="button" className="text-button" onClick={() => { basket.remove(product.id); announce(`${product.name} removed from your basket`) }}>Remove<span className="visually-hidden"> {product.name}</span></button>}
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Read-only lines and totals, used beside checkout and on the confirmation. */
export function OrderSummary({ totals, title = 'Your demo basket', editable = false, feeLabel }: { totals: Totals; title?: string; editable?: boolean; feeLabel?: string }) {
  return (
    <section className="order-summary" aria-labelledby="order-summary-title">
      <div className="order-summary__head">
        <h2 id="order-summary-title">{title}</h2>
        {editable && <Link to="/basket" className="text-button">Edit basket</Link>}
      </div>
      <ul className="order-summary__lines">
        {totals.lines.map(line => (
          <li key={line.product.id}>
            <span>{line.product.name} <span className="muted">× {line.qty}</span></span>
            <span>{formatUGX(line.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="order-summary__totals">
        <div><dt>Subtotal ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})</dt><dd>{formatUGX(totals.subtotal)}</dd></div>
        <div><dt>{feeLabel ?? 'Demo fee'}</dt><dd>{totals.fee === null ? 'Choose delivery or collection' : formatUGX(totals.fee)}</dd></div>
        <div className="order-summary__total"><dt>Demo total</dt><dd>{totals.total === null ? formatUGX(totals.subtotal) + ' + fee' : formatUGX(totals.total)}</dd></div>
      </dl>
      <p className="fine-print">Fictional prices and fees for demonstration. No payment is requested.</p>
    </section>
  )
}
