import { Link } from 'react-router'
import type { Product } from '../data/catalogue'
import { categoryLabel } from '../data/catalogue'
import { formatUGX } from '../data/commerce'
import { ProductImg } from './Img'
import { AddToBasket } from './AddToBasket'

export function ProductCard({ product, headingLevel = 3 }: { product: Product; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const
  return (
    <article className="product-card">
      <Link to={`/shop/${product.slug}`} className="product-card__media" tabIndex={-1} aria-hidden="true">
        <ProductImg product={product} sizes="(min-width: 1100px) 280px, (min-width: 640px) 33vw, 50vw" alt="" />
      </Link>
      <div className="product-card__body">
        <p className="product-card__category">{categoryLabel(product.category)}</p>
        <Heading className="product-card__name"><Link to={`/shop/${product.slug}`}>{product.name}</Link></Heading>
        <p className="product-card__price">{formatUGX(product.price)} <span className="demo-tag">demo price</span></p>
        <AddToBasket product={product} className="product-card__add" />
      </div>
    </article>
  )
}
