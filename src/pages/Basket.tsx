import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { basket, priceBasket, useBasket, type Basket as BasketLinesState } from '../lib/basket'
import { DEMO_FEES, formatUGX } from '../data/commerce'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { announce } from '../components/Announcer'
import { BasketLines } from '../components/BasketParts'
import { EmptyState, PageIntro } from '../components/Bits'

export default function Basket() {
  useDocumentTitle('Basket')
  const lines = useBasket()
  const totals = priceBasket(lines)
  const [confirming, setConfirming] = useState(false)
  const [undo, setUndo] = useState<BasketLinesState | null>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (confirming) confirmRef.current?.focus() }, [confirming])
  // Adding anything after clearing makes the undo meaningless.
  useEffect(() => { if (lines.length) setUndo(null) }, [lines.length])

  const clear = () => {
    setUndo(lines)
    basket.clear()
    setConfirming(false)
    announce('Basket cleared.')
  }

  return (
    <>
      <PageIntro title="Your basket">
        <p>Demo prices in Uganda shillings. You’ll choose delivery or collection at checkout.</p>
      </PageIntro>
      <div className="container section section--tight">
        {totals.lines.length ? (
          <div className="basket-page">
            <div className="basket-page__lines">
              <BasketLines />
              <div className="basket-page__bar">
                <Link to="/shop" className="text-button">Continue shopping</Link>
                {confirming ? (
                  <div className="confirm-inline" role="group" aria-label="Confirm clearing the basket">
                    <span>Remove every item?</span>
                    <button ref={confirmRef} type="button" className="button button--small button--danger" onClick={clear}>Yes, clear basket</button>
                    <button type="button" className="button button--small button--ghost" onClick={() => setConfirming(false)}>Keep items</button>
                  </div>
                ) : (
                  <button type="button" className="text-button" onClick={() => setConfirming(true)}>Clear basket</button>
                )}
              </div>
            </div>
            <aside className="basket-page__summary" aria-label="Basket total">
              <dl className="order-summary__totals">
                <div><dt>Subtotal ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})</dt><dd>{formatUGX(totals.subtotal)}</dd></div>
                <div><dt>Demo delivery fee</dt><dd>{formatUGX(DEMO_FEES.delivery)}</dd></div>
                <div><dt>Demo collection fee</dt><dd>{formatUGX(DEMO_FEES.collection)}</dd></div>
              </dl>
              <p className="fine-print">The fee is added once you choose delivery or collection. Fictional amounts; no payment is requested.</p>
              <Link to="/checkout" className="button button--primary button--block button--large">Go to demo checkout</Link>
            </aside>
          </div>
        ) : (
          <EmptyState art="empty-basket" title="Your basket is empty"
            actions={<>
              <Link to="/shop" className="button button--primary">Explore the demo shop</Link>
              {undo && <button type="button" className="button button--ghost" onClick={() => { basket.restore(undo); setUndo(null); announce('Basket restored.') }}>Undo clear</button>}
            </>}>
            <p>Add everyday essentials to try the delivery or collection journey. Looking for a medicine? <Link to="/enquire/availability">Ask a branch about it</Link>.</p>
          </EmptyState>
        )}
      </div>
    </>
  )
}
