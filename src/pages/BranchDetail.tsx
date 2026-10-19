import { Link, useParams } from 'react-router'
import { STATUS_EXPLAINED, STATUS_LABEL, findBranch } from '../data/branches'
import { setPreferredBranch, usePreferredBranch } from '../lib/preferredBranch'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { announce } from '../components/Announcer'
import { DemoNote, PageIntro } from '../components/Bits'
import { Icon } from '../components/Icon'
import NotFound from './NotFound'

export default function BranchDetail() {
  const { slug } = useParams()
  const branch = findBranch(slug)
  useDocumentTitle(branch ? `${branch.name} branch` : 'Branch not found')
  const preferred = usePreferredBranch()

  if (!branch) return <NotFound title="We couldn’t find that branch." body="It may not be in this concept’s directory." />
  const chosen = preferred === branch.slug

  return (
    <>
      <PageIntro title={branch.name} crumbs={[{ to: '/branches', label: 'Branches' }]}
        aside={<DemoNote title={STATUS_LABEL[branch.status]}>{STATUS_EXPLAINED[branch.status]}</DemoNote>}>
        <p>{branch.locationNote}</p>
      </PageIntro>
      <div className="container section section--tight branch-detail">
        <div className="branch-detail__main">
          <section aria-labelledby="use-title" className="branch-detail__use">
            <h2 id="use-title">Use this branch</h2>
            <p>Set it as your preferred branch for this visit, or start an enquiry with it already chosen.</p>
            <div className="button-row">
              <button type="button" className={`button ${chosen ? 'button--chosen' : 'button--primary'}`} aria-pressed={chosen}
                onClick={() => { setPreferredBranch(chosen ? null : branch.slug); announce(chosen ? `${branch.name} is no longer your preferred branch.` : `${branch.name} set as your preferred branch for this visit.`) }}>
                {chosen ? <><Icon name="check" size={18} /> Preferred branch</> : 'Set as preferred branch'}
              </button>
              <Link to="/enquire/availability" onClick={() => setPreferredBranch(branch.slug)} className="button button--outline">Ask this branch about an item</Link>
              <Link to="/enquire/pharmacist" onClick={() => setPreferredBranch(branch.slug)} className="button button--ghost">Contact a pharmacist here</Link>
            </div>
          </section>

          <section aria-labelledby="sources-title">
            <h2 id="sources-title">What the sources say</h2>
            <ul className="source-list">
              {branch.sources.map(source => <li key={source.label}><strong>{source.label}.</strong> {source.detail}</li>)}
            </ul>
          </section>

          {branch.listedContacts.length > 0 && (
            <section aria-labelledby="contacts-title">
              <h2 id="contacts-title">Contact details found, not confirmed</h2>
              <p className="muted">Shown as text rather than links because they conflict between sources or come from leads. Please don’t treat them as verified.</p>
              <ul className="source-list">
                {branch.listedContacts.map(contact => <li key={contact.value}><strong className="unverified">{contact.value}</strong> <span className="muted">({contact.source})</span></li>)}
              </ul>
            </section>
          )}
        </div>

        <aside className="branch-detail__aside" aria-labelledby="confirm-title">
          <h2 id="confirm-title">To confirm before launch</h2>
          <ul className="todo-list">
            {branch.toConfirm.map(item => <li key={item}>{item}</li>)}
          </ul>
          <p className="fine-print">Directions are left out until the exact location is confirmed. Photographs on this site are illustrative and do not show this branch.</p>
        </aside>
      </div>
    </>
  )
}
