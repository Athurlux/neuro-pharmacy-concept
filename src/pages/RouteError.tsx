import { useRouteError } from 'react-router'

/** Last-resort screen, e.g. when a page chunk fails to load after a new deployment. */
export function RouteError() {
  const error = useRouteError()
  console.error(error)
  return (
    <main className="container section" id="main">
      <h1>Something went wrong loading this page.</h1>
      <p style={{ margin: '1rem 0' }}>Reloading usually fixes it, especially just after the site has been updated.</p>
      <div className="button-row">
        <button type="button" className="button button--primary" onClick={() => window.location.reload()}>Reload the page</button>
        <a className="button button--ghost" href="/">Go to the homepage</a>
      </div>
    </main>
  )
}
