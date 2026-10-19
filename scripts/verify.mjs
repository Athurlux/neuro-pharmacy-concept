// Compact browser journey check. Run against a preview build:
//   npm run build && npm run preview -- --port 4178   (another terminal)
//   npm run verify     or   VERIFY_URL=https://neuro-pharmacy-concept.pages.dev npm run verify
// One headless Chrome, one page at a time. Checks wait for state rather than sampling once.
import { chromium } from 'playwright'

const BASE = (process.env.VERIFY_URL ?? 'http://127.0.0.1:4178').replace(/\/$/, '')
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const KEY = 'neuro-concept-basket'
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }

const browser = await chromium.launch({ executablePath: CHROME })
const context = await browser.newContext({ viewport: { width: 1280, height: 860 } })
const page = await context.newPage()
const requests = []
const failures = []
const errors = []
page.on('request', request => requests.push({ method: request.method(), url: request.url() }))
page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`) })
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })

const go = async path => { await page.goto(BASE + path, { waitUntil: 'networkidle' }) }
const sees = async (text, timeout = 8000) => page.getByText(text).first().waitFor({ timeout }).then(() => true, () => false)
const waitFor = (fn, arg) => page.waitForFunction(fn, arg, { timeout: 5000 }).then(() => true, () => false)
const button = name => page.getByRole('button', { name, exact: true })
const count = () => page.locator('.basket-toggle .count').innerText()
const countIs = n => waitFor(n => document.querySelector('.basket-toggle .count')?.textContent === String(n), n)
const stored = () => page.evaluate(key => localStorage.getItem(key), KEY)
const cards = n => waitFor(n => document.querySelectorAll('.product-grid--shop .product-card').length === n, n)
const runSample = async finalLabel => {
  for (let step = 0; step < 6 && !(await button(finalLabel).count()); step++) {
    if (await button('Use sample details').count()) await button('Use sample details').click()
    if (await button('Use demo document').count()) await button('Use demo document').click()
    await page.locator('.flow__actions button[type="submit"]').click()
    await page.waitForTimeout(150)
  }
  return (await button(finalLabel).count()) > 0
}

try {
  // 1. Homepage quick enquiry carries branch and item in memory, not the URL
  await go('/')
  await page.locator('#quick-branch').selectOption('bukoto')
  await page.locator('#quick-item').fill('Sample tablets')
  await button('Continue to enquiry').click()
  await page.waitForURL(/\/enquire\/availability$/)
  check('quick enquiry carries the item and branch', (await page.locator('#item').inputValue()) === 'Sample tablets' && await page.getByRole('radio', { name: /^Bukoto/ }).isChecked())
  check('the item name never enters the URL', !page.url().toLowerCase().includes('tablets'))
  check('availability enquiry completes without a stock result', await runSample('Complete demo enquiry') && (await button('Complete demo enquiry').click(), await sees('no branch checked its stock')))

  // 2. Shop: search, filters, empty state, Back, chips, sort, reset
  await go('/shop')
  await page.locator('#shop-q').fill('tooth')
  await page.waitForURL(/q=tooth/)
  check('search narrows and lives in the URL', await cards(2))
  await page.getByRole('button', { name: 'Home health', exact: true }).click()
  check('conflicting filters show a useful empty state', await sees('No items match these filters'))
  await page.goBack()
  await page.waitForURL(url => !url.toString().includes('category='))
  check('Back undoes the last filter', await cards(2))
  await page.getByRole('button', { name: /tooth.*remove filter/ }).click()
  check('removing the search chip shows all 8', await cards(8))
  await page.locator('#shop-sort').selectOption('price-asc')
  check('price sort puts the cheapest first', await waitFor(() => document.querySelector('.product-grid--shop .product-card__name')?.textContent === 'Pocket tissues'))
  await page.getByRole('button', { name: 'Reset all' }).click()
  check('reset restores the default list', await cards(8) && !page.url().includes('?'))
  await page.reload({ waitUntil: 'networkidle' })

  // 3. Product detail, quantity, add and merge
  await go('/shop/soap')
  await page.getByRole('button', { name: 'One more', exact: true }).click()
  await page.getByRole('button', { name: 'One more', exact: true }).click()
  await page.getByRole('button', { name: /^Add to basket: Soap bar/ }).click()
  check('adding three updates the header and announces it', await countIs(3) && await sees('3 × Soap bar added'))
  await go('/shop/first-aid-pouch')
  await page.getByRole('button', { name: /^Add to basket: First aid storage pouch/ }).click()
  await page.getByRole('button', { name: /^Add to basket: First aid storage pouch/ }).click()
  check('adding the same item again merges into one line', await countIs(5) && await sees('2 in your basket'))
  check('the pouch is described as empty', await sees('It is sold empty; no supplies are included.'))

  // 4. Basket panel dialog: focus, totals, Escape, restore
  await page.locator('.basket-toggle').click()
  const dialog = page.getByRole('dialog', { name: 'Your basket' })
  check('basket panel opens with focus inside', await dialog.isVisible() && await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null))
  check('panel subtotal agrees with the lines', await dialog.getByText('UGX 51,000').isVisible())
  await page.keyboard.press('Escape')
  check('Escape closes the panel and restores focus', !(await dialog.isVisible()) && await page.evaluate(() => document.activeElement?.classList.contains('basket-toggle')))

  // 5. Basket page: persistence, quantities, storage, removal, clear and undo
  await go('/basket')
  await page.reload({ waitUntil: 'networkidle' })
  check('basket survives a refresh', (await page.locator('.basket-page .basket-line').count()) === 2 && (await count()) === '5')
  await page.getByRole('button', { name: 'One more Soap bar' }).click()
  check('quantity changes update line total and count', await sees('UGX 20,000') && await countIs(6))
  check('storage holds only IDs and quantities', (await stored()) === '{"version":1,"items":[{"id":"product-soap","qty":4},{"id":"product-first-aid-pouch","qty":2}]}', await stored())
  await page.locator('.basket-page').getByRole('button', { name: 'Remove First aid storage pouch — empty' }).click()
  check('removing a line updates every total', await countIs(4) && await sees('Subtotal (4 items)'))
  await button('Clear basket').click()
  await button('Yes, clear basket').click()
  check('clearing shows the empty state', await sees('Your basket is empty') && await countIs(0))
  await button('Undo clear').click()
  check('clearing can be undone', await countIs(4))

  // 6. Checkout: branch carried from the directory, fees, validation, review/edit, completion
  // The preferred branch lives in memory only, so move between pages inside the app.
  await go('/branches')
  await page.getByRole('button', { name: 'Use this branch' }).first().click()
  await page.locator('.basket-toggle').click()
  await page.getByRole('link', { name: 'Go to demo checkout' }).click()
  await page.waitForURL(/\/checkout$/)
  await button('Next').click()
  check('missing choice shows an error summary and moves focus', await page.locator('.error-summary').isVisible() && await waitFor(() => document.activeElement?.closest('#fulfilment') !== null))
  await page.getByRole('radio', { name: /^Collect from a branch/ }).check()
  check('collection shows a zero demo fee', await page.locator('.flow__aside .order-summary__totals').getByText('UGX 0', { exact: true }).isVisible() && await page.locator('.flow__aside .order-summary__total').getByText('UGX 20,000').isVisible())
  await page.getByRole('radio', { name: /^Delivery/ }).check()
  check('delivery adds the UGX 5,000 demo fee', await page.locator('.flow__aside .order-summary__total').getByText('UGX 25,000').isVisible())
  await button('Next').click()
  check('preferred branch carried into checkout', await page.getByRole('radio', { name: /^Kyanja/ }).isChecked())
  await page.locator('#phone').fill('12')
  await button('Use sample details').click()
  await button('Next').click()
  check('an invalid phone is rejected with a linked error', (await page.locator('#phone-error').innerText()).includes('Ugandan number'))
  await page.locator('#phone').fill('+256 700 123 456')
  await button('Next').click()
  check('delivery step asks for an address', await page.locator('#address').waitFor({ timeout: 5000 }).then(() => true, () => false))
  await button('Use sample details').click()
  await button('Review').click()
  check('review shows items and the demo total', await page.locator('.order-summary').getByText('UGX 25,000').isVisible() && await sees('Plot 12, Sample Lane'))
  await page.getByRole('button', { name: /Edit Delivery or collection/ }).click()
  await page.getByRole('radio', { name: /^Collect from a branch/ }).check()
  await button('Next').click(); await button('Review').click()
  check('editing to collection drops the address and the fee', await sees('Review your demo order') && !(await page.getByText('Plot 12, Sample Lane').count()) && await page.locator('.order-summary__total').getByText('UGX 20,000').isVisible())
  await button('Complete demo order').dblclick()
  await page.waitForURL(/\/checkout\/confirmation$/)
  check('confirmation states nothing was placed, paid or reserved', await sees('Demo complete. No order was placed, no payment was taken and no items were reserved.'))
  check('confirmation shows reference, items, totals and preference', await sees(/NP-DEMO-[A-Z2-9]{6}/) && await sees('Collection (demo)') && await page.locator('.order-summary__total').getByText('UGX 20,000').isVisible() && await page.getByRole('button', { name: 'Print summary' }).isVisible())
  check('no dispatch or approval language', !/dispatched|on the way|approved/i.test(await page.locator('main').innerText()))
  check('basket emptied after completion', await countIs(0))
  await page.goBack({ waitUntil: 'networkidle' })
  check('Back cannot complete the order twice', await sees('Checkout needs at least one item') && !(await button('Complete demo order').count()))
  await page.goForward({ waitUntil: 'networkidle' })
  await page.reload({ waitUntil: 'networkidle' })
  check('refreshed confirmation shows an honest fallback', await sees('There’s no demo order to show.'))

  // 7. Prescription walk-through with the fictional sample only
  await go('/prescriptions')
  check('no file input exists on the prescription page', (await page.locator('input[type="file"]').count()) === 0)
  await button('Use demo document').click()
  check('the fictional sample previews', await waitFor(() => { const img = document.querySelector('.demo-doc__preview img'); return Boolean(img?.complete && img.naturalWidth > 0) }))
  check('prescription simulation completes', await runSample('Complete simulation') && (await button('Complete simulation').click(), await sees('Nothing was uploaded or sent')))

  // 8. Pharmacist and contact journeys
  await go('/branches/kawempe')
  await page.getByRole('link', { name: 'Contact a pharmacist here' }).click()
  await page.waitForURL(/pharmacist/)
  check('a branch page carries its branch into the pharmacist request', await page.getByRole('radio', { name: /^Kawempe/ }).isChecked())
  check('pharmacist request completes', await runSample('Complete demo request') && (await button('Complete demo request').click(), await sees('no pharmacist has seen it')))
  await go('/contact')
  check('listed contacts are kept apart from the form and not linked', await page.locator('.real-contact').getByText('neuropharmaltd@gmail.com').isVisible() && (await page.locator('a[href^="tel:"], a[href^="mailto:"]').count()) === 0)
  check('contact completes', await runSample('Complete demo message') && (await button('Complete demo message').click(), await sees('No message was sent.')))

  // 9. Storage recovery and direct nested routes
  await page.evaluate(key => localStorage.setItem(key, '{"version":1,"items":[{"id":"ghost"}'), KEY)
  await go('/basket')
  check('corrupt storage recovers to an empty basket', await sees('Your basket is empty') && (await count()) === '0')
  for (const [path, text] of [
    ['/shop/thermometer', 'Digital thermometer'],
    ['/shop/aspirin', 'We couldn’t find that item.'],
    ['/branches/kanyanya', 'Kanyanya–Bahai Road'],
    ['/branches/nowhere', 'We couldn’t find that branch.'],
    ['/delivery', 'to your doorstep.'],
    ['/checkout?step=review', 'Your basket is empty'],
    ['/no-such-page', 'This page isn’t here.'],
  ]) { await go(path); check(`direct load ${path}`, await sees(text)) }

  // 10. Keyboard menu at phone width; reduced motion
  await page.setViewportSize({ width: 390, height: 800 })
  await go('/about')
  await page.getByRole('button', { name: 'Open menu' }).click()
  check('mobile menu focuses its first link', await page.evaluate(() => document.activeElement?.textContent === 'Home'))
  await page.keyboard.press('Escape')
  check('Escape closes the menu and restores focus', await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Open menu'))
  const reduced = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1280, height: 860 } })
  await reduced.goto(BASE + '/', { waitUntil: 'networkidle' })
  check('reduced motion: settled hero and no step sequence', await reduced.evaluate(() => !document.documentElement.classList.contains('hero-pending')
    && getComputedStyle(document.querySelector('[data-hero="line"]')).transform === 'none' && !document.querySelector('.is-sequenced')))
  await reduced.close()

  // 11. No trigger build-up across navigation and resizing
  await page.setViewportSize({ width: 1280, height: 860 })
  await go('/')
  const initial = await page.evaluate(() => window.__scrollTriggerCount?.())
  for (let i = 0; i < 3; i++) {
    await page.locator('.site-nav').getByRole('link', { name: 'Delivery' }).click()
    await page.waitForURL(/delivery/)
    await page.getByRole('link', { name: 'Neuro Pharmacy concept, home' }).click()
    await page.waitForURL(url => new URL(url).pathname === '/')
  }
  for (const width of [800, 1280, 900, 1300, 1280]) { await page.setViewportSize({ width, height: 860 }); await page.waitForTimeout(200) }
  await page.waitForTimeout(400)
  const after = await page.evaluate(() => window.__scrollTriggerCount?.())
  check('ScrollTrigger count stable after navigation and resizing', typeof initial === 'number' && initial > 0 && after === initial, `${initial} → ${after}`)

  // 12. Overflow sweep with something in the basket
  await page.evaluate(key => localStorage.setItem(key, '{"version":1,"items":[{"id":"product-first-aid-pouch","qty":12},{"id":"product-thermometer","qty":1}]}'), KEY)
  const overflow = []
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 860 })
    for (const path of ['/', '/shop', '/shop/first-aid-pouch', '/basket', '/delivery', '/checkout', '/branches', '/branches/kyanja', '/prescriptions']) {
      await go(path)
      const extra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      if (extra > 0) overflow.push(`${path}@${width}:${extra}`)
    }
  }
  check('no horizontal overflow at 360–1440', overflow.length === 0, overflow.join(', '))

  // 13. Nothing leaves the browser; nothing sensitive is stored; nothing broken
  const origin = new URL(BASE).origin
  const nonGet = requests.filter(request => request.method !== 'GET')
  const thirdParty = requests.filter(request => !request.url.startsWith(origin) && !request.url.startsWith('data:'))
  const personal = requests.filter(request => /nambi|sample%20tablets|sample tablets|example\.com|0700|plot/i.test(decodeURIComponent(request.url)))
  check('no non-GET requests', nonGet.length === 0, nonGet.map(request => request.url).join(', '))
  check('no third-party requests', thirdParty.length === 0, [...new Set(thirdParty.map(request => new URL(request.url).host))].join(', '))
  check('no entered details in any request URL', personal.length === 0)
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), dump: JSON.stringify({ ...localStorage }), all: JSON.stringify({ ...localStorage, ...sessionStorage }) }))
  // React Router keeps scroll positions (paths and numbers) in sessionStorage; nothing else is allowed.
  check('only the basket is stored, with no personal or enquiry data', storage.local.every(key => key === 'neuro-concept-basket') && storage.session.every(key => key === 'react-router-scroll-positions')
    && !/kyanja|bukoto|kawempe/i.test(storage.dump) && !/nambi|tablets|example\.com|0700|plot|sample/i.test(storage.all), [...storage.local, ...storage.session].join(', '))
  check('no failed requests (images, chunks)', failures.length === 0, failures.slice(0, 3).join(' | '))
  check('no console or page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
} catch (error) {
  check('journey ran to completion', false, error.message.split('\n')[0])
} finally {
  await browser.close()
}

const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
