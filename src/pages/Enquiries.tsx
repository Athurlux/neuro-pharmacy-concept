import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { availabilityFlow, contactFlow, pharmacistFlow, prescriptionFlow } from '../forms/flows'
import { FormFlow } from '../forms/FormFlow'
import type { Draft, FlowSpec } from '../forms/engine'
import type { FlowOptions } from '../forms/useFormFlow'
import { usePreferredBranch } from '../lib/preferredBranch'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { DemoNote, PageIntro } from '../components/Bits'
import { SceneImg } from '../components/Img'
import { PORTFOLIO_URL } from '../components/Footer'

interface FlowPageProps<T extends Draft> extends FlowOptions<T> {
  title: string
  intro: ReactNode
  note: ReactNode
  flow: FlowSpec<T>
  after?: ReactNode
  doneLinks?: { label: string; to: string }[]
  restartLabel?: string
}

/** Shared frame for the enquiry journeys: intro with its demo note, the form, then extras. */
function FlowPage<T extends Draft>({ title, intro, note, flow, after, doneLinks, restartLabel, ...options }: FlowPageProps<T>) {
  useDocumentTitle(title)
  return (
    <>
      <PageIntro title={title} aside={<DemoNote>{note}</DemoNote>}>{intro}</PageIntro>
      <div className="container section section--tight">
        <FormFlow flow={flow} doneLinks={doneLinks} restartLabel={restartLabel} {...options} />
        {after}
      </div>
    </>
  )
}

/** The branch chosen elsewhere (directory, homepage, branch page) fills an empty branch field. */
const useBranchPrefill = () => {
  const preferred = usePreferredBranch()
  return preferred ? { branch: preferred } : undefined
}

export function Availability() {
  return (
    <FlowPage flow={availabilityFlow} referencePrefix="NP-ASK" prefill={useBranchPrefill()}
      title="Ask about an item"
      intro={<p>Ask whether a branch has a particular item. A pharmacist would check and reply; this page never shows stock and does not recommend alternatives.</p>}
      note={<>Nothing is sent and no stock is checked. An enquiry is not an order and nothing is held for you. Please use sample details.</>}
      doneLinks={[{ label: 'Find a branch', to: '/branches' }, { label: 'Explore the demo shop', to: '/shop' }]}
    />
  )
}

export function Pharmacist() {
  return (
    <FlowPage flow={pharmacistFlow} referencePrefix="NP-PHA" prefill={useBranchPrefill()}
      title="Contact a pharmacist"
      intro={<p>Leave a short note and say how you’d like a reply. In a real service, a member of the pharmacy team would get back to you; this page gives no advice or diagnosis.</p>}
      note={<>No one receives this request and no pharmacist is online here. For urgent symptoms, contact a health facility directly.</>}
      doneLinks={[{ label: 'Ask about an item', to: '/enquire/availability' }]}
      after={(
        <figure className="flow-figure">
          <SceneImg name="pharmacist-conversation" sizes="(min-width: 900px) 600px, 100vw" alt="A pharmacist talks with a customer at a consultation desk (illustrative image)." />
          <figcaption>Illustrative image. The people shown are not Neuro Pharmacy staff.</figcaption>
        </figure>
      )}
    />
  )
}

export function Prescription() {
  return (
    <FlowPage flow={prescriptionFlow} referencePrefix="NP-SIM" prefill={useBranchPrefill()}
      title="Prescription process (demo)"
      intro={<>
        <p>A walk-through of how a prescription enquiry could start online: choose a document, preview it, pick a branch and review. It uses a fictional sample only.</p>
        <p>Please don’t share real prescriptions or patient records with this public concept. There is no upload, no reading of documents and no clinical review.</p>
      </>}
      note={<>Simulation only. A real service would need the original prescription and a pharmacist’s review before anything could be dispensed.</>}
      doneLinks={[{ label: 'Contact a pharmacist', to: '/enquire/pharmacist' }]}
      restartLabel="Run the simulation again"
    />
  )
}

export function Contact() {
  return (
    <FlowPage flow={contactFlow} referencePrefix="NP-MSG"
      title="Contact"
      intro={<p>General questions, branch information, business enquiries or feedback. For a question about a medicine or product, <Link to="/enquire/pharmacist">contact a pharmacist</Link> instead.</p>}
      note={<>This form sends nothing. It shows how a contact journey could work.</>}
      after={(
        <div className="real-contact">
          <section aria-labelledby="listed-title">
            <h2 id="listed-title">Contact details found in public listings</h2>
            <p>A 2025–26 health directory lists <strong className="unverified">neuropharmaltd@gmail.com</strong> for Neuro Pharmacy Limited. Branch phone numbers vary between sources; see each <Link to="/branches">branch page</Link>. None has been confirmed for this concept, so none is linked.</p>
          </section>
          <section aria-labelledby="concept-title">
            <h2 id="concept-title">About this website concept</h2>
            <p>Questions about the design itself go to its author, Arthur Kitandwe, not to the pharmacy.</p>
            <a className="text-link" href={PORTFOLIO_URL} rel="noopener">Arthur Kitandwe’s portfolio</a>
          </section>
        </div>
      )}
    />
  )
}
