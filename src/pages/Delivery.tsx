import { useRef } from 'react'
import { Link } from 'react-router'
import { useSiteMotion } from '../animation/useSiteMotion'
import { DEMO_FEES, formatUGX } from '../data/commerce'
import { priceBasket, useBasket } from '../lib/basket'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { Icon } from '../components/Icon'
import { SceneImg } from '../components/Img'

const FAQS = [
  {
    q: 'Is this a real delivery service?',
    a: 'No. This page shows how a delivery option could work on a future Neuro Pharmacy website. It is part of an independent concept; nothing is dispatched and no rider is assigned.',
  },
  {
    q: 'What does delivery cost?',
    a: `The checkout uses a demo fee of ${formatUGX(DEMO_FEES.delivery)} for delivery and ${formatUGX(DEMO_FEES.collection)} for collection, so the totals can be shown working. They are not real prices.`,
  },
  {
    q: 'Which areas would be covered, and how quickly?',
    a: 'Coverage and timing would be set by the pharmacy. This concept doesn’t promise either, so it shows no delivery zones and no arrival times.',
  },
  {
    q: 'Could I have medicines delivered?',
    a: 'The demo shop has everyday essentials only. Whether and how medicines could be delivered would depend on the pharmacy’s own procedures and the rules that apply. You can ask a branch about an item with an availability enquiry.',
  },
  {
    q: 'How would I pay?',
    a: 'Payment is not part of this concept. No card details, mobile money PIN or payment request is ever asked for.',
  },
  {
    q: 'Can I collect instead?',
    a: 'Yes. At checkout, choose collection and a preferred branch. In the demo, nothing is reserved; a real service would confirm when items are ready.',
  },
]

export default function Delivery() {
  useDocumentTitle('Delivery')
  const root = useRef<HTMLDivElement>(null)
  useSiteMotion(root)
  const count = priceBasket(useBasket()).itemCount

  return (
    <div ref={root}>
      <section className="dhero" aria-labelledby="dhero-title">
        <picture className="dhero__media">
          <source media="(min-width: 900px)" srcSet="/images/delivery-hero-desktop-768.webp 768w, /images/delivery-hero-desktop-1536.webp 1536w" sizes="58vw" width={1536} height={1024} />
          <img data-hero="photo" src="/images/delivery-hero-mobile-800.webp" srcSet="/images/delivery-hero-mobile-480.webp 480w, /images/delivery-hero-mobile-800.webp 800w, /images/delivery-hero-mobile-1024.webp 1024w" sizes="100vw"
            width={1024} height={1024} fetchPriority="high" decoding="async"
            alt="A rider in a teal jacket and helmet beside a motorbike with a teal box marked “Neuro Pharmacy”, outside a pharmacy (illustrative image)." />
        </picture>
        <div className="dhero__panel">
          <h1 id="dhero-title" className="dhero__title">
            <span className="line"><span data-hero="line">From your neighbourhood pharmacy</span></span>
            <span className="line"><span data-hero="line">to your doorstep.</span></span>
          </h1>
          <p className="dhero__lede" data-hero="lede">Choose everyday essentials, then have them delivered or collect them from a branch.</p>
          <p className="dhero__note"><Icon name="info" size={18} /> A proposed delivery experience for this concept. No real coverage, dispatch or arrival times are offered.</p>
          <div className="button-row">
            <Link to="/shop" className="button button--light">Shop demo essentials</Link>
            <Link to="/basket" className="button button--on-dark">View basket{count ? ` (${count})` : ''}</Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title" id="how-title">How the demo works</h2>
            <p>Three steps, all in your browser. Nothing is sent, charged or reserved.</p>
          </div>
          <ol className="how-steps">
            <li><span className="how-steps__num" aria-hidden="true">1</span><h3>Fill your basket</h3><p>Add items from the demo shop and adjust quantities. Your basket is remembered on this device.</p></li>
            <li><span className="how-steps__num" aria-hidden="true">2</span><h3>Choose how to receive them</h3><p>Pick delivery or collection, a preferred branch and your details. Sample details are one click away.</p></li>
            <li><span className="how-steps__num" aria-hidden="true">3</span><h3>Review and complete</h3><p>Edit anything, then complete the demo for a reference and a printable summary.</p></li>
          </ol>
        </div>
      </section>

      <section className="section section--mint" aria-labelledby="options-title">
        <div className="container">
          <h2 className="section-title" id="options-title">Delivery or collection</h2>
          <div className="options">
            <article className="option-card">
              <Icon name="delivery" size={30} />
              <h3>Delivery</h3>
              <p className="option-card__fee">{formatUGX(DEMO_FEES.delivery)} <span className="demo-tag">demo fee</span></p>
              <ul className="check-list">
                <li>Give an address, a general area and an optional note for the rider.</li>
                <li>The order is linked to the branch you prefer.</li>
                <li>No delivery window or arrival time is promised.</li>
              </ul>
            </article>
            <article className="option-card">
              <Icon name="collection" size={30} />
              <h3>Collection</h3>
              <p className="option-card__fee">{formatUGX(DEMO_FEES.collection)} <span className="demo-tag">demo fee</span></p>
              <ul className="check-list">
                <li>Choose the branch you’d like to collect from.</li>
                <li>Nothing is held for you in the demo; a real branch would confirm first.</li>
                <li>Branch details are still being confirmed. <Link to="/branches">See branches</Link></li>
              </ul>
            </article>
          </div>
          <div className="button-row options__cta">
            <Link to={count ? '/checkout' : '/shop'} className="button button--primary">{count ? 'Continue to demo checkout' : 'Start in the demo shop'}</Link>
            {count > 0 && <Link to="/basket" className="button button--ghost">Review basket ({count})</Link>}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="handover-title">
        <div className="container split split--reverse">
          <figure className="split__media" data-anim="scene">
            <SceneImg name="delivery-handover" sizes="(min-width: 900px) 50vw, 100vw" alt="A smiling rider hands a teal pharmacy bag to a customer at her gate, his motorbike and delivery box behind him (illustrative image)." />
          </figure>
          <div className="split__text">
            <h2 className="section-title" id="handover-title">At the door</h2>
            <p>The idea is simple: a familiar branch, a clearly marked box and a short handover. Details such as identity checks, payment on delivery and what can be delivered would be decided by the pharmacy before any launch.</p>
            <p className="muted">Illustrative scene. Not a photograph of a real delivery or rider.</p>
          </div>
        </div>
      </section>

      <section className="section section--tight faq-section" aria-labelledby="faq-title">
        <div className="container faq">
          <h2 className="section-title" id="faq-title">Questions</h2>
          <div className="faq__list">
            {FAQS.map(item => (
              <details key={item.q} className="faq__item">
                <summary>{item.q}<Icon name="plus" size={18} /></summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
