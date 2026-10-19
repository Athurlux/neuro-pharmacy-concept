import type { RefObject } from 'react'
import { gsap, ScrollTrigger, useGSAP } from './gsap'

const DUR = { fast: 0.35, base: 0.6, slow: 0.9 }
const EASE = { out: 'power3.out', expo: 'expo.out', reveal: 'power2.inOut' }

const revealPending = () => document.documentElement.classList.remove('hero-pending')

/**
 * One scoped context per page. useGSAP reverts every tween and ScrollTrigger on unmount,
 * and matchMedia reverts per-breakpoint work on resize, so navigation and resizing cannot
 * pile triggers up. Content is visible by default: elements are hidden only inside the
 * motion branch, right before their reveal is armed, and links, buttons and form controls
 * are never hidden.
 */
export function useSiteMotion(root: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' }, context => {
      const { motion, desktop } = context.conditions as { motion: boolean; desktop: boolean }
      const scope = root.current
      if (!scope || !motion) { revealPending(); return }
      const cleanups: (() => void)[] = []

      // ---- Hero: the headline rises line by line, the photograph settles -------------------
      if (scope.querySelector('[data-hero="line"]')) {
        const tl = gsap.timeline({ defaults: { ease: EASE.out } })
        tl.from('[data-hero="line"]', { yPercent: 105, duration: DUR.slow, stagger: 0.1, ease: EASE.expo })
          .from('[data-hero="lede"]', { y: 12, opacity: 0, duration: DUR.base }, '-=0.55')
          .from('[data-hero="photo"]', { scale: 1.05, duration: 1.4, ease: 'power2.out' }, 0)
          // The enquiry ledge only moves; it is never transparent, so it is usable at once.
          .from('[data-hero="ledge"]', { y: desktop ? 28 : 12, duration: DUR.slow }, 0.15)
        revealPending()
        // Reaching for a control mid-entrance finishes the entrance at once.
        const settle = () => tl.progress(1)
        scope.addEventListener('pointerdown', settle)
        scope.addEventListener('focusin', settle)
        cleanups.push(() => { scope.removeEventListener('pointerdown', settle); scope.removeEventListener('focusin', settle) })
      } else {
        revealPending()
      }

      // ---- Category and product cards: a small, quick stagger, batched -------------------
      const cards = gsap.utils.toArray<HTMLElement>('[data-anim="card"]', scope)
      if (cards.length) {
        gsap.set(cards, { y: desktop ? 22 : 12, opacity: 0 })
        ScrollTrigger.batch(cards, {
          start: 'top 94%', once: true,
          onEnter: batch => gsap.to(batch, { y: 0, opacity: 1, duration: DUR.base, stagger: 0.06, ease: EASE.out, clearProps: 'transform,opacity' }),
        })
      }

      // ---- Scenes: the frame opens from the bottom edge as it enters view ------------------
      gsap.utils.toArray<HTMLElement>('[data-anim="scene"]', scope).forEach(frame => {
        const image = frame.querySelector('img')
        const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 85%', once: true } })
        tl.fromTo(frame, { clipPath: 'inset(14% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: EASE.reveal, clearProps: 'clipPath' })
        if (image) tl.from(image, { scale: 1.06, duration: 1.3, ease: 'power2.out', clearProps: 'transform' }, 0)
      })

      // ---- Journey steps (desktop): the step beside the sticky picture lights up as it
      // passes the middle of the screen. Native scroll and normal flow; nothing is pinned.
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]', scope)
      if (desktop && steps.length) {
        const story = scope.querySelector<HTMLElement>('[data-story]')
        story?.classList.add('is-sequenced')
        steps.forEach(step => {
          ScrollTrigger.create({
            trigger: step, start: 'top 55%', end: 'bottom 55%',
            onToggle: self => {
              step.classList.toggle('is-active', self.isActive)
              if (self.isActive && story) story.dataset.active = step.dataset.step
            },
          })
        })
        cleanups.push(() => {
          story?.classList.remove('is-sequenced')
          if (story) delete story.dataset.active
          steps.forEach(step => step.classList.remove('is-active'))
        })
      }

      // Late fonts and lazy images shift layout; recalculate trigger positions once they land.
      let alive = true
      const refresh = () => { if (alive) ScrollTrigger.refresh() }
      document.fonts.ready.then(refresh)
      window.addEventListener('load', refresh, { once: true })
      return () => { alive = false; window.removeEventListener('load', refresh); cleanups.forEach(cleanup => cleanup()) }
    })

    return () => revealPending()
  }, { scope: root, dependencies: [] })
}
