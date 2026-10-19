import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Link previews read the HTML before any JavaScript runs, so /delivery gets its own copy of
 * the built index.html with the delivery preview image and wording. Cloudflare Pages serves
 * dist/delivery.html at /delivery ahead of the SPA fallback in _redirects.
 */
function deliveryPreview(): Plugin {
  return {
    name: 'delivery-preview',
    apply: 'build',
    closeBundle() {
      const dist = fileURLToPath(new URL('./dist', import.meta.url))
      const html = readFileSync(resolve(dist, 'index.html'), 'utf8')
      const swaps: [RegExp, string][] = [
        [/social-home-1200x630\.jpg/g, 'social-delivery-1200x630.jpg'],
        [/(<meta property="og:url" content="[^"]*)\/"/, '$1/delivery"'],
        [/<title>[^<]*<\/title>/, '<title>Delivery · Neuro Pharmacy (independent concept)</title>'],
        [/Your neighbourhood pharmacy, a clearer way to connect \(independent concept\)/g, 'From your neighbourhood pharmacy to your doorstep (independent concept)'],
        [/content="Neuro Pharmacy website concept preview with a pharmacist at a bright counter"/, 'content="Neuro Pharmacy website concept preview with a delivery rider and a marked delivery box"'],
      ]
      let page = html
      for (const [pattern, value] of swaps) {
        if (!pattern.test(page)) throw new Error(`delivery-preview: pattern not found ${pattern}`)
        page = page.replace(pattern, value)
      }
      writeFileSync(resolve(dist, 'delivery.html'), page)
    },
  }
}

export default defineConfig({
  plugins: [react(), deliveryPreview()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
