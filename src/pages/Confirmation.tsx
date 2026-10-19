import { Link } from 'react-router'
import { CONFIRMATION_TEXT, formatUGX } from '../data/commerce'
import { useForms } from '../forms/FormsContext'
import { checkoutFlow } from '../forms/flows'
import { Summary } from '../forms/FormFlow'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { Icon } from '../components/Icon'

/**
 * Reads the completion held in memory. A refresh or a direct visit has none, and gets an
 * honest explanation rather than a made-up successful order.
 */
export default function Confirmation() {
  const completion = useForms().completions[checkoutFlow.key]
  const order = completion?.order
  useDocumentTitle(order ? 'Demo complete' : 'No demo order to show')

  if (!completion || !order) {
    return (
      <div className="container section confirm">
        <div className="flow flow--done">
          <h1 className="confirm__title">There’s no demo order to show.</h1>
          <p>Demo confirmations exist only in memory during a visit, so they disappear after a refresh or when this page is opened from a link. No order was ever placed.</p>
          <div className="button-row">
            <Link to="/basket" className="button button--primary">Go to your basket</Link>
            <Link to="/shop" className="button button--ghost">Explore the demo shop</Link>
          </div>
        </div>
      </div>
    )
  }

  const fulfilmentLabel = order.fulfilment === 'delivery' ? 'Delivery' : 'Collection'
  return (
    <div className="container section confirm">
      <div className="flow flow--done">
        <img className="flow__done-art" src="/states/demo-complete.svg" alt="" width={120} height={87} />
        <p className="flow__ref">Demo reference <strong>{completion.reference}</strong></p>
        <h1 className="confirm__title">Demo complete</h1>
        <p className="notice notice--demo" role="status"><strong>{CONFIRMATION_TEXT}</strong></p>
        <p>Your demo basket has been emptied, as it would be after a real order. {order.fulfilment === 'delivery'
          ? 'In a real service, the branch would contact you to confirm delivery before anything happened.'
          : 'In a real service, the branch would confirm when items were ready before you travelled.'}</p>

        <section className="order-summary" aria-labelledby="confirm-items">
          <div className="order-summary__head"><h2 id="confirm-items">Items</h2></div>
          <ul className="order-summary__lines">
            {order.lines.map(line => (
              <li key={line.id}>
                <span>{line.name} <span className="muted">× {line.qty} at {formatUGX(line.unitPrice)}</span></span>
                <span>{formatUGX(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="order-summary__totals">
            <div><dt>Subtotal ({order.itemCount} {order.itemCount === 1 ? 'item' : 'items'})</dt><dd>{formatUGX(order.subtotal)}</dd></div>
            <div><dt>Demo {fulfilmentLabel.toLowerCase()} fee</dt><dd>{formatUGX(order.fee)}</dd></div>
            <div className="order-summary__total"><dt>Demo total</dt><dd>{formatUGX(order.total)}</dd></div>
          </dl>
          <p className="fine-print">Fictional prices and fees. Nothing was charged.</p>
        </section>

        <Summary sections={completion.sections} meta={completion.meta} />

        <div className="button-row no-print">
          <button type="button" className="button button--primary" onClick={() => window.print()}><Icon name="print" size={18} /> Print summary</button>
          <Link to="/shop" className="button button--ghost">Continue shopping</Link>
        </div>
        <p className="fine-print">This summary is held in memory for this visit only and disappears if you refresh.</p>
      </div>
    </div>
  )
}
