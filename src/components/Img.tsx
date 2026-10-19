import type { ImgHTMLAttributes } from 'react'
import type { Product } from '../data/catalogue'

type Base = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height' | 'alt'> & { alt: string; sizes: string; priority?: boolean }

const loading = (priority = false) => ({
  loading: priority ? ('eager' as const) : ('lazy' as const),
  decoding: 'async' as const,
  fetchPriority: priority ? ('high' as const) : ('auto' as const),
})

// Each scene ships two sizes: the pack's 768px web file and its full master.
const SCENES = {
  'home-hero-desktop': [1536, 1024],
  'delivery-hero-desktop': [1536, 1024],
  'delivery-handover': [1536, 1024],
  'collection-counter': [1536, 1024],
  'category-personal-care': [1536, 1024],
  'pharmacist-conversation': [1672, 941],
} as const

export type SceneName = keyof typeof SCENES

export function SceneImg({ name, alt, sizes, priority, ...rest }: Base & { name: SceneName }) {
  const [width, height] = SCENES[name]
  return (
    <img
      src={`/images/${name}-768.webp`}
      srcSet={`/images/${name}-768.webp 768w, /images/${name}-${width}.webp ${width}w`}
      sizes={sizes} width={width} height={height} alt={alt} {...loading(priority)} {...rest}
    />
  )
}

/** Square product photograph on an opaque off-white ground (1254 master, 768 web). */
export function ProductImg({ product, sizes, priority, alt, ...rest }: Omit<Base, 'alt'> & { product: Product; alt?: string }) {
  return (
    <img
      src={`/images/${product.id}-768.webp`}
      srcSet={`/images/${product.id}-768.webp 768w, /images/${product.id}-1254.webp 1254w`}
      sizes={sizes} width={1254} height={1254} alt={alt ?? product.alt} {...loading(priority)} {...rest}
    />
  )
}
