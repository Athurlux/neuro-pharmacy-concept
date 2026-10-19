import { useRef, useState } from 'react'
import { basket, MAX_QTY, useBasket } from '../lib/basket'
import type { Product } from '../data/catalogue'
import { gsap, useGSAP } from '../animation/gsap'
import { announce } from './Announcer'
import { Icon } from './Icon'

// Kept apart from the other basket parts so GSAP loads only with pages that sell items,
// not with the header on every route.
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Adds to the shared basket and confirms in three ways: the polite live region, the
 * button's own label, and a short GSAP settle on its check mark (skipped with reduced motion).
 */
export function AddToBasket({ product, qty = 1, className = '', label = 'Add to basket' }: { product: Product; qty?: number; className?: string; label?: string }) {
  const root = useRef<HTMLButtonElement>(null)
  const [added, setAdded] = useState(false)
  const timer = useRef<number>(0)
  const { contextSafe } = useGSAP({ scope: root })
  const inBasket = useBasket().find(line => line.id === product.id)?.qty ?? 0

  const pulse = contextSafe(() => {
    if (reducedMotion()) return
    gsap.fromTo('.add-btn__icon', { scale: 0.4, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.45, ease: 'back.out(2.2)' })
    gsap.fromTo(root.current, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: 'power2.out', clearProps: 'transform' })
  })

  const onClick = () => {
    const result = basket.add(product.id, qty)
    if (!result.added) {
      announce(`${product.name}: the demo basket holds up to ${MAX_QTY} of one item.`)
      return
    }
    announce(`${result.added === 1 ? '' : `${result.added} × `}${product.name} added. ${result.qty} in your basket.`)
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1800)
    requestAnimationFrame(pulse)
  }

  return (
    <button ref={root} type="button" className={`button button--primary add-btn ${added ? 'is-added' : ''} ${className}`} onClick={onClick}
      aria-label={`${label}: ${product.name}${inBasket ? ` (${inBasket} in basket)` : ''}`}>
      <Icon className="add-btn__icon" name={added ? 'check' : 'plus'} size={18} />
      <span>{added ? 'Added' : label}</span>
    </button>
  )
}
