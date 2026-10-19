import { Link } from 'react-router'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { EmptyState } from '../components/Bits'

export default function NotFound({ title = 'This page isn’t here.', body = 'The link may be mistyped, or the page may have moved.' }: { title?: string; body?: string }) {
  useDocumentTitle('Page not found')
  return (
    <div className="container section">
      <EmptyState art="no-results" title={title}
        actions={<><Link to="/" className="button button--primary">Go to the homepage</Link><Link to="/shop" className="button button--ghost">Explore the demo shop</Link><Link to="/branches" className="button button--ghost">Find a branch</Link></>}>
        <p>{body}</p>
      </EmptyState>
    </div>
  )
}
