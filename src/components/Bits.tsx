import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from './Icon'

/** The supplied concept wordmark (proposed, not the official identity). */
export function Logo({ tone = 'teal', height = 40 }: { tone?: 'teal' | 'ivory'; height?: number }) {
  return <img className="logo" src={`/brand/logo-concept-${tone}.svg`} width={Math.round((height * 440) / 124)} height={height} alt="Neuro Pharmacy" />
}

/** The short local notice placed beside forms and checkout actions. */
export function DemoNote({ title = 'Demo only', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="demo-note">
      <Icon name="info" size={20} />
      <div><p className="demo-note__title">{title}</p><div className="demo-note__body">{children}</div></div>
    </div>
  )
}

interface Crumb { to: string; label: string }

export function PageIntro({ title, children, aside, crumbs }: { title: string; children?: ReactNode; aside?: ReactNode; crumbs?: Crumb[] }) {
  return (
    <header className={`page-intro ${aside ? 'page-intro--aside' : ''}`}>
      <div className="container page-intro__inner">
        <div>
          {crumbs && (
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol>
                {crumbs.map(crumb => <li key={crumb.to}><Link to={crumb.to}>{crumb.label}</Link></li>)}
                <li aria-current="page">{title}</li>
              </ol>
            </nav>
          )}
          <h1>{title}</h1>
          {children && <div className="page-intro__lede">{children}</div>}
        </div>
        {aside && <div className="page-intro__aside">{aside}</div>}
      </div>
    </header>
  )
}

export function EmptyState({ art, title, children, actions }: { art: 'empty-basket' | 'no-results'; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="empty-state">
      <img src={`/states/${art}.svg`} width={180} height={130} alt="" />
      <h2 className="empty-state__title">{title}</h2>
      {children}
      {actions && <div className="button-row">{actions}</div>}
    </div>
  )
}

/**
 * The prescription-process journey's only "document": the fictional sample from the asset
 * pack. There is deliberately no file input, so a real prescription cannot be added here.
 */
export function DemoDocument({ selected, onSelect, onRemove }: { selected: boolean; onSelect: () => void; onRemove: () => void }) {
  if (!selected) {
    return (
      <div className="demo-doc demo-doc--empty">
        <Icon name="document" size={28} />
        <p>Real prescriptions can’t be added to this public concept. The sample is fictional and intentionally invalid.</p>
        <button type="button" className="button button--primary" onClick={onSelect}>Use demo document</button>
      </div>
    )
  }
  return (
    <div className="demo-doc">
      <figure className="demo-doc__preview">
        <img src="/samples/prescription-process-demo.svg" width={600} height={780} alt="Fictional sample headed “Demo process sample”, stating it is not a prescription and not valid for dispensing, with grey placeholder lines and no patient, clinician, medicine, dose or signature." />
        <figcaption>Preview of the fictional sample. It stays in the page and is never uploaded.</figcaption>
      </figure>
      <div className="demo-doc__meta">
        <p><Icon name="check" size={18} /> <strong>Demo document selected</strong></p>
        <button type="button" className="text-button" onClick={onRemove}>Remove demo document</button>
      </div>
    </div>
  )
}
