import { Link } from 'react-router'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { PageIntro } from '../components/Bits'
import { SceneImg } from '../components/Img'
import { PORTFOLIO_URL } from '../components/Footer'

export default function About() {
  useDocumentTitle('About this concept')
  return (
    <>
      <PageIntro title="About this concept">
        <p>A proposal for how Neuro Pharmacy’s website could help people find a branch, ask about an item and order everyday essentials, designed and built as a working demo.</p>
      </PageIntro>
      <div className="container section section--tight prose-layout">
        <div className="prose">
          <section id="concept" aria-labelledby="concept-title">
            <h2 id="concept-title">An independent website concept</h2>
            <p>This site is an unsolicited proposal. It is not Neuro Pharmacy’s official website, not an ordering service, and has not been commissioned or approved by Neuro Pharmacy. The wordmark is a concept proposal, not the pharmacy’s verified identity.</p>
            <p>Concept design &amp; development by Arthur Kitandwe. <a href={PORTFOLIO_URL} rel="noopener">See more of his work</a>.</p>
          </section>
          <section aria-labelledby="real-title">
            <h2 id="real-title">What is real and what is not</h2>
            <ul className="check-list">
              <li>The eight shop items and their prices are fictional, and nothing can be bought.</li>
              <li>Delivery and collection fees are demonstration amounts; no coverage, dispatch or arrival time is offered.</li>
              <li>People, interiors, storefronts and deliveries in the photographs are illustrative artwork, not staff or premises.</li>
              <li>Branch locations come from public listings and leads that disagree; each <Link to="/branches">branch page</Link> shows its sources.</li>
              <li>Forms send nothing. Enquiries, the prescription walk-through and checkout end with an honest demo summary.</li>
              <li>The prescription walk-through uses a fictional sample. Real prescriptions can’t be added.</li>
            </ul>
          </section>
          <section aria-labelledby="data-title">
            <h2 id="data-title">Your information</h2>
            <p>The site keeps one thing on your device: the product IDs and quantities in your demo basket. Names, phone numbers, addresses, enquiries and branch choices stay in this browser tab and disappear on refresh. There are no analytics or tracking scripts.</p>
          </section>
          <section aria-labelledby="launch-title">
            <h2 id="launch-title">What a real launch would need</h2>
            <p>Confirmed branches and contacts, an approved brand and content, a real product catalogue, order handling with the pharmacy’s own procedures, an appropriate prescription process, and data protection that meets Uganda’s requirements.</p>
          </section>
        </div>
        <figure className="prose-figure">
          <SceneImg name="collection-counter" sizes="(min-width: 900px) 40vw, 100vw" alt="A pharmacist hands a customer a bag across a bright counter (illustrative image)." />
          <figcaption>Illustrative image, not a photograph of a Neuro Pharmacy branch or its staff.</figcaption>
        </figure>
      </div>
    </>
  )
}
