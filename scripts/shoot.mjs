// Screenshot helper for design review: node scripts/shoot.mjs <outDir> <width> <path...>
// One headless Chrome, one page at a time. Full-page captures with motion reduced so
// every section is in its final state.
import { chromium } from 'playwright'

const [outDir, width, ...paths] = process.argv.slice(2)
const BASE = (process.env.SHOOT_URL ?? 'http://127.0.0.1:4178').replace(/\/$/, '')
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: CHROME })
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(width) < 700 ? 800 : 900 }, reducedMotion: process.env.MOTION ? 'no-preference' : 'reduce' })
// SEED='<json>' preloads localStorage (e.g. a shortlist) before each page loads.
if (process.env.SEED) await page.addInitScript(seed => { for (const [key, value] of Object.entries(JSON.parse(seed))) localStorage.setItem(key, value) }, process.env.SEED)
try {
  for (const path of paths) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    await page.evaluate(async () => {
      await document.fonts.ready
      for (const img of document.images) img.loading = 'eager'
      await Promise.all([...document.images].map(img => img.decode().catch(() => {})))
    })
    await page.waitForTimeout(300)
    const name = `${(path.replace(/[/?=&#]+/g, '_').replace(/^_|_$/g, '') || 'home')}-${width}.png`
    await page.screenshot({ path: `${outDir}/${name}`, fullPage: process.env.FOLD ? false : true })
    console.log(name)
  }
} finally {
  await browser.close()
}
