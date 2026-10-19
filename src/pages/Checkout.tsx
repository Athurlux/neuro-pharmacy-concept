import { Link } from 'react-router'
import { branchLabel } from '../data/branches'
import { checkoutFlow, type CheckoutDraft } from '../forms/flows'
import { FormFlow } from '../forms/FormFlow'
import { REVIEW } from '../forms/useFormFlow'
import { basket, priceBasket, useBasket } from '../lib/basket'
import { usePreferredBranch } from '../lib/preferredBranch'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { OrderSummary } from '../components/BasketParts'
import { DemoNote, EmptyState, PageIntro } from '../components/Bits'

const feeLabel = (fulfilment: string | null) =>
  fulfilment === 'delivery' ? 'Demo delivery fee' : fulfilment === 'collection' ? 'Demo collection fee' : 'Demo fee'

export default function Checkout() {
  useDocumentTitle('Demo checkout')
  const lines = useBasket()
  const preferred = usePreferredBranch()

  return (
    <>
      <PageIntro title="Demo checkout" crumbs={[{ to: '/basket', label: 'Basket' }]}
        aside={<DemoNote>No order is placed and no payment is taken. Fees are demonstration amounts, and nothing is reserved at a branch.</DemoNote>}>
        <p>Choose delivery or collection, add sample details, then review everything before completing the demo.</p>
      </PageIntro>
      <div className="container section section--tight">
        {lines.length ? (
          <FormFlow<CheckoutDraft>
            flow={checkoutFlow}
            referencePrefix="NP-DEMO"
            prefill={{ branch: preferred && preferred !== 'no-preference' ? preferred : null }}
            doneRoute={() => '/checkout/confirmation'}
            aside={(draft, step) => step === REVIEW ? null : <OrderSummary totals={priceBasket(lines, draft.fulfilment)} editable feeLabel={feeLabel(draft.fulfilment)} />}
            reviewLead={draft => <OrderSummary totals={priceBasket(lines, draft.fulfilment)} title="Items and demo totals" editable feeLabel={feeLabel(draft.fulfilment)} />}
            blockCompletion={() => (basket.snapshot().length ? null : 'Your basket is now empty. Add an item before completing the demo order.')}
            extra={draft => {
              // The confirmation shows exactly what was reviewed, even if the basket changes later.
              const totals = priceBasket(basket.snapshot(), draft.fulfilment)
              const fulfilment = draft.fulfilment === 'delivery' ? 'delivery' : 'collection'
              return {
                meta: [
                  { label: 'Fulfilment preference', value: fulfilment === 'delivery' ? 'Delivery (demo)' : 'Collection (demo)' },
                  { label: 'Preferred branch', value: branchLabel(draft.branch) },
                ],
                order: {
                  lines: totals.lines.map(line => ({ id: line.product.id, name: line.product.name, qty: line.qty, unitPrice: line.product.price, lineTotal: line.lineTotal })),
                  itemCount: totals.itemCount, subtotal: totals.subtotal, fee: totals.fee ?? 0, total: totals.total ?? totals.subtotal,
                  fulfilment, branch: branchLabel(draft.branch),
                },
              }
            }}
            // A real checkout would empty the basket once the order exists; the demo mirrors that.
            afterComplete={() => basket.clear()}
          />
        ) : (
          <EmptyState art="empty-basket" title="Your basket is empty"
            actions={<><Link to="/shop" className="button button--primary">Explore the demo shop</Link><Link to="/delivery" className="button button--ghost">How delivery would work</Link></>}>
            <p>Checkout needs at least one item. Anything you’ve already entered here is kept for this visit, so you can carry on once you’ve added something.</p>
          </EmptyState>
        )}
      </div>
    </>
  )
}
