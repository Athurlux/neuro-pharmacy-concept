import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { categoryLabel, findProductBySlug, relatedProducts } from '../data/catalogue'
import { formatUGX } from '../data/commerce'
import { MAX_QTY, useBasket } from '../lib/basket'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { AddToBasket } from '../components/AddToBasket'
import { DemoNote } from '../components/Bits'
import { Icon } from '../components/Icon'
import { ProductImg } from '../components/Img'
import { ProductCard } from '../components/ProductCard'
import NotFound from './NotFound'

export default function ProductDetail() {
  const { slug } = useParams()
  const product = findProductBySlug(slug)
  useDocumentTitle(product ? product.name : 'Item not found')
  const [qty, setQty] = useState(1)
  const inBasket = useBasket().find(line => line.id === product?.id)?.qty ?? 0

  if (!product) return <NotFound title="We couldn’t find that item." body="It may have been removed from the demo shop, or the link may be mistyped." />

  const room = MAX_QTY - inBasket
  return (
    <>
      <div className="container section section--tight product">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to={`/shop?category=${product.category}`}>{categoryLabel(product.category)}</Link></li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>
        <div className="product__layout">
          <figure className="product__media">
            <ProductImg product={product} sizes="(min-width: 900px) 46vw, 100vw" priority />
            <figcaption>Illustrative product image with a blank label.</figcaption>
          </figure>
          <div className="product__info">
            <h1 className="product__name">{product.name}</h1>
            <p className="product__price">{formatUGX(product.price)} <span className="demo-tag">demo price</span></p>
            <p className="product__description">{product.description}</p>

            <div className="product__buy">
              <div className="field">
                <span className="field__label" id="qty-label">Quantity</span>
                <div className="qty qty--large" role="group" aria-labelledby="qty-label">
                  <button type="button" className="qty__btn" onClick={() => setQty(value => Math.max(1, value - 1))} disabled={qty <= 1} aria-label="One fewer"><Icon name="minus" size={18} /></button>
                  <span className="qty__value" aria-live="polite">{qty}</span>
                  <button type="button" className="qty__btn" onClick={() => setQty(value => Math.min(Math.max(1, room), value + 1))} disabled={qty >= room} aria-label="One more"><Icon name="plus" size={18} /></button>
                </div>
              </div>
              <AddToBasket product={product} qty={qty} className="button--large product__add" />
            </div>
            {inBasket > 0 && (
              <p className="product__in-basket"><Icon name="check" size={18} /> {inBasket} in your basket. <Link to="/basket">View basket</Link></p>
            )}

            <DemoNote title="Demo availability">
              This is a fictional item. No stock levels are shown because none are known; in a real shop, availability would come from the branch.
              Medicines are not sold here. To ask about one, <Link to="/enquire/availability">send an availability enquiry</Link>.
            </DemoNote>
          </div>
        </div>
      </div>

      <section className="section section--mint" aria-labelledby="related-title">
        <div className="container">
          <h2 className="section-title" id="related-title">You might also add</h2>
          <ul className="product-grid product-grid--three">
            {relatedProducts(product).map(item => <li key={item.id}><ProductCard product={item} /></li>)}
          </ul>
        </div>
      </section>
    </>
  )
}
