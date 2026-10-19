import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { Announcer } from './Announcer'
import { useRouteFocus } from '../lib/useRouteFocus'

export function Layout() {
  useRouteFocus()
  const { pathname } = useLocation()
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      {/* Keyed by path so each page gets a short, calm fade in (none with reduced motion). */}
      <main id="main" tabIndex={-1} key={pathname} className="page-enter">
        <Outlet />
      </main>
      <Footer />
      <Announcer />
      {/* Form steps and shop filters change only the search string, so they keep the page's
          scroll entry. First-loaded pages share the key "default", so key them by path. */}
      <ScrollRestoration getKey={loc => (loc.key === 'default' || loc.pathname === '/shop' || loc.search.includes('step=') ? loc.pathname : loc.key)} />
    </>
  )
}
