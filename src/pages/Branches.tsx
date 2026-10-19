import { Link } from 'react-router'
import { BRANCHES, STATUS_EXPLAINED, STATUS_LABEL, type BranchStatus } from '../data/branches'
import { setPreferredBranch, usePreferredBranch } from '../lib/preferredBranch'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { announce } from '../components/Announcer'
import { DemoNote, PageIntro } from '../components/Bits'
import { Icon } from '../components/Icon'

const GROUPS: { status: BranchStatus; title: string }[] = [
  { status: 'reference', title: 'Listed in public directories' },
  { status: 'lead', title: 'Provisional leads' },
]

export default function Branches() {
  useDocumentTitle('Branches')
  const preferred = usePreferredBranch()

  return (
    <>
      <PageIntro title="Find a branch" aside={<DemoNote title="Details still being confirmed">Public sources disagree about Neuro Pharmacy’s branches and phone numbers. This directory shows what each source says and leaves out hours, map pins and services until the business confirms them.</DemoNote>}>
        <p>Choose a branch to carry it into enquiries and the demo checkout. Your choice is kept for this visit only.</p>
      </PageIntro>
      <div className="container section section--tight">
        {GROUPS.map(group => (
          <section key={group.status} className="branch-group" aria-labelledby={`group-${group.status}`}>
            <div className="branch-group__head">
              <h2 id={`group-${group.status}`}>{group.title}</h2>
              <p>{STATUS_EXPLAINED[group.status]}</p>
            </div>
            <ul className="branch-list">
              {BRANCHES.filter(branch => branch.status === group.status).map(branch => {
                const chosen = preferred === branch.slug
                return (
                  <li key={branch.slug} className={`branch-card ${chosen ? 'is-chosen' : ''}`}>
                    <div className="branch-card__head">
                      <Icon name="branch" size={22} />
                      <h3><Link to={`/branches/${branch.slug}`}>{branch.name}</Link></h3>
                      <span className={`status status--${branch.status}`}>{STATUS_LABEL[branch.status]}</span>
                    </div>
                    <p className="branch-card__location">{branch.locationNote}</p>
                    <div className="branch-card__actions">
                      <button type="button" className={`button button--small ${chosen ? 'button--chosen' : 'button--outline'}`} aria-pressed={chosen}
                        onClick={() => { setPreferredBranch(chosen ? null : branch.slug); announce(chosen ? `${branch.name} is no longer your preferred branch.` : `${branch.name} set as your preferred branch for this visit.`) }}>
                        {chosen ? <><Icon name="check" size={16} /> Preferred branch</> : 'Use this branch'}
                      </button>
                      <Link to={`/branches/${branch.slug}`} className="text-button">Details and sources<span className="visually-hidden"> for {branch.name}</span></Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
        <p className="source-note">Sources were rechecked on 19 October 2026. No coordinates, opening hours, “open now” status, drive-through, delivery coverage or payment methods are shown, because none could be confirmed.</p>
      </div>
    </>
  )
}
