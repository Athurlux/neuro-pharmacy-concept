// Every journey on the site is a declarative spec run by the shared engine. Nothing is
// sent anywhere: completion produces an in-memory summary and a demo reference only.
import { type Draft, type Errors, type FieldSpec, type FlowSpec } from './engine'
import { BRANCH_OPTIONS } from '../data/branches'
import { DEMO_FEES, formatUGX } from '../data/commerce'

const SAMPLE_PERSON = { name: 'Sarah Nambi', phone: '0700 123 456', email: 'sarah.nambi@example.com' }

const branchField = <T extends Draft>(hint: string): FieldSpec<T> => ({
  name: 'branch' as keyof T & string,
  label: 'Preferred branch',
  kind: 'radio',
  hint,
  options: BRANCH_OPTIONS,
  requiredMessage: 'Choose a branch, or “No preference”.',
})

const METHOD_OPTIONS = [
  { value: 'call', label: 'Phone call' },
  { value: 'sms', label: 'Text message' },
  { value: 'email', label: 'Email' },
]

/** Name, phone and email, where the chosen contact method decides which one is required. */
function contactFields<T extends Draft>(): FieldSpec<T>[] {
  return [
    { name: 'method' as keyof T & string, label: 'How should the branch reply?', kind: 'radio', options: METHOD_OPTIONS, requiredMessage: 'Choose how you’d like a reply.' },
    { name: 'name' as keyof T & string, label: 'Your name', kind: 'text', autoComplete: 'name', maxLength: 80 },
    { name: 'phone' as keyof T & string, label: 'Phone number', kind: 'tel', autoComplete: 'tel', optional: true, hint: 'Ugandan (0772 123 456) or international with +.' },
    { name: 'email' as keyof T & string, label: 'Email address', kind: 'email', autoComplete: 'email', optional: true },
  ]
}

function methodRule(draft: Draft): Errors {
  if (draft.method === 'email' && !draft.email?.trim()) return { email: 'Enter an email address, since you chose a reply by email.' }
  if ((draft.method === 'call' || draft.method === 'sms') && !draft.phone?.trim()) return { phone: 'Enter a phone number, since you chose a call or text.' }
  return {}
}

const contactGroup = <T extends Draft>() => [{ id: 'contact', legend: 'Your contact details', hint: 'Sample details are fine. This concept sends nothing.', fields: ['name', 'phone', 'email'] as (keyof T & string)[] }]

// ---- Medicine availability -----------------------------------------------------------------

export type AvailabilityDraft = Record<'item' | 'detail' | 'branch' | 'method' | 'name' | 'phone' | 'email', string | null>

export const availabilityFlow: FlowSpec<AvailabilityDraft> = {
  key: 'availability',
  stages: [
    {
      id: 'item',
      title: 'The item',
      intro: 'Name the item you’re looking for. A branch would check and reply; this page cannot see stock.',
      fields: [
        { name: 'item', label: 'Item name', kind: 'text', maxLength: 80, hint: 'As written on the pack or by your prescriber.', wide: true },
        { name: 'detail', label: 'Strength or form', kind: 'text', optional: true, maxLength: 60, hint: 'Only if you know it, e.g. as printed on the pack. Leave blank if unsure.', wide: true },
        branchField('Branch details are provisional in this concept; see the branch directory.'),
      ],
    },
    { id: 'contact', title: 'How to reach you', fields: contactFields<AvailabilityDraft>(), validate: methodRule },
  ],
  groups: contactGroup<AvailabilityDraft>(),
  empty: () => ({ item: null, detail: null, branch: null, method: null, name: null, phone: null, email: null }),
  sample: () => ({ item: 'Sample item name', branch: 'no-preference', method: 'sms', ...SAMPLE_PERSON }),
  review: { title: 'Review your availability enquiry', intro: 'Check the details. Each section can be edited.' },
  final: { label: 'Complete demo enquiry', note: 'Demo only: nothing is sent and no stock is checked or reserved.' },
  done: {
    title: 'Demo enquiry complete',
    body: 'No enquiry was sent and no branch checked its stock. In a real service, a branch would confirm availability with you directly; an enquiry is not an order and nothing is held for you.',
  },
}

// ---- Pharmacist contact --------------------------------------------------------------------

export type PharmacistDraft = Record<'topic' | 'message' | 'branch' | 'method' | 'name' | 'phone' | 'email', string | null>

export const pharmacistFlow: FlowSpec<PharmacistDraft> = {
  key: 'pharmacist',
  stages: [
    {
      id: 'topic',
      title: 'What it’s about',
      fields: [
        {
          name: 'topic', label: 'Topic', kind: 'radio', options: [
            { value: 'shop-item', label: 'An item in the shop' },
            { value: 'own-medicine', label: 'A medicine you already have', description: 'For example, how to store it' },
            { value: 'branch-service', label: 'What a branch can help with' },
            { value: 'other', label: 'Something else' },
          ],
        },
        { name: 'message', label: 'Short message', kind: 'textarea', optional: true, maxLength: 300, rows: 3, hint: 'Keep it brief and leave out medical history. A pharmacist would ask for what they need.' },
        branchField('The branch you’d most like to hear from.'),
      ],
    },
    { id: 'contact', title: 'How to reach you', fields: contactFields<PharmacistDraft>(), validate: methodRule },
  ],
  groups: contactGroup<PharmacistDraft>(),
  empty: () => ({ topic: null, message: null, branch: null, method: null, name: null, phone: null, email: null }),
  sample: () => ({ topic: 'shop-item', message: 'Sample question about an item in the demo shop.', branch: 'no-preference', method: 'call', ...SAMPLE_PERSON }),
  review: { title: 'Review your request', intro: 'Check the details. Each section can be edited.' },
  final: { label: 'Complete demo request', note: 'Demo only: no pharmacist receives this and no advice is given here.' },
  done: {
    title: 'Demo request complete',
    body: 'No request was sent and no pharmacist has seen it. In a real service, the branch would contact you using the method you chose. For urgent symptoms, contact a health facility directly.',
  },
}

// ---- Prescription process (fictional sample only) -----------------------------------------

export const DEMO_DOCUMENT = 'prescription-process-demo'
export type PrescriptionDraft = Record<'document' | 'branch' | 'method', string | null>

export const prescriptionFlow: FlowSpec<PrescriptionDraft> = {
  key: 'prescription',
  stages: [
    {
      id: 'document',
      title: 'Choose the demo document',
      intro: 'This concept does not accept real prescriptions. Use the fictional sample to see how the steps would work.',
      fields: [{
        name: 'document', label: 'Document', kind: 'document',
        options: [{ value: DEMO_DOCUMENT, label: 'Fictional process sample (not a prescription)' }],
        requiredMessage: 'Choose “Use demo document” to continue.',
      }],
    },
    {
      id: 'branch',
      title: 'Branch and reply',
      fields: [
        branchField('Where you would take the original prescription in a real service.'),
        { name: 'method', label: 'How should the branch reply?', kind: 'radio', options: METHOD_OPTIONS, requiredMessage: 'Choose how you’d like a reply.' },
      ],
    },
  ],
  empty: () => ({ document: null, branch: null, method: null }),
  sample: () => ({ document: DEMO_DOCUMENT, branch: 'no-preference', method: 'sms' }),
  review: { title: 'Review the demo enquiry', intro: 'This is the point where a real service would hand the request to a branch.' },
  final: { label: 'Complete simulation', note: 'Simulation only: nothing is uploaded, read, reviewed or approved.' },
  done: {
    title: 'Simulation complete',
    body: 'Nothing was uploaded or sent, and no one reviewed the sample. A real service would need the original prescription and a pharmacist’s review before anything could be dispensed.',
  },
}

// ---- General contact -----------------------------------------------------------------------

export type ContactDraft = Record<'topic' | 'message' | 'method' | 'name' | 'phone' | 'email', string | null>

export const contactFlow: FlowSpec<ContactDraft> = {
  key: 'contact',
  stages: [
    {
      id: 'message',
      title: 'Your message',
      fields: [
        {
          name: 'topic', label: 'Topic', kind: 'select', options: [
            { value: 'general', label: 'General question' },
            { value: 'branches', label: 'Branch locations or hours' },
            { value: 'business', label: 'Business or supplier enquiry' },
            { value: 'feedback', label: 'Feedback' },
          ],
        },
        { name: 'message', label: 'Message', kind: 'textarea', minLength: 10, maxLength: 600, rows: 5 },
      ],
    },
    { id: 'contact', title: 'How to reach you', fields: contactFields<ContactDraft>(), validate: methodRule },
  ],
  groups: contactGroup<ContactDraft>(),
  empty: () => ({ topic: null, message: null, method: null, name: null, phone: null, email: null }),
  sample: () => ({ topic: 'general', message: 'Sample message to show how the contact form works.', method: 'email', ...SAMPLE_PERSON }),
  review: { title: 'Review your message', intro: 'Check the details. Each section can be edited.' },
  final: { label: 'Complete demo message', note: 'Demo only: no message is sent.' },
  done: { title: 'Demo message complete', body: 'No message was sent. In a real service, it would reach the business by the route it chooses to publish.' },
}

// ---- Checkout ------------------------------------------------------------------------------

export const LOCALITIES = ['Kyanja', 'Kisasi', 'Komamboga', 'Ntinda', 'Bukoto', 'Naguru', 'Kanyanya', 'Kawempe', 'Kira', 'Bulindo', 'Another area']

export type CheckoutDraft = Record<'fulfilment' | 'branch' | 'name' | 'phone' | 'email' | 'address' | 'locality' | 'note', string | null>

export const checkoutFlow: FlowSpec<CheckoutDraft> = {
  key: 'checkout',
  stages: [
    {
      id: 'fulfilment',
      title: 'Delivery or collection',
      intro: 'Both options and their fees are demonstrations, not a service or prices on offer.',
      fields: [{
        name: 'fulfilment', label: 'How would you get your items?', kind: 'radio',
        options: [
          { value: 'delivery', label: 'Delivery', description: `Demo fee ${formatUGX(DEMO_FEES.delivery)}. No coverage area or arrival time is promised.` },
          { value: 'collection', label: 'Collect from a branch', description: `Demo fee ${formatUGX(DEMO_FEES.collection)}. Nothing is reserved for you.` },
        ],
        requiredMessage: 'Choose delivery or collection.',
      }],
    },
    {
      id: 'details',
      title: 'Branch and contact',
      fields: [
        { ...branchField<CheckoutDraft>('Branch details are provisional in this concept.'), options: BRANCH_OPTIONS.filter(option => option.value !== 'no-preference'), requiredMessage: 'Choose a branch.' },
        { name: 'name', label: 'Full name', kind: 'text', autoComplete: 'name', maxLength: 80 },
        { name: 'phone', label: 'Phone number', kind: 'tel', autoComplete: 'tel', hint: 'Ugandan (0772 123 456) or international with +.' },
        { name: 'email', label: 'Email address', kind: 'email', autoComplete: 'email', optional: true },
      ],
    },
    {
      id: 'address',
      title: 'Delivery details',
      when: draft => draft.fulfilment === 'delivery',
      fields: [
        { name: 'address', label: 'Street address or building', kind: 'text', autoComplete: 'street-address', maxLength: 120, wide: true, hint: 'A sample address is fine.' },
        { name: 'locality', label: 'General area', kind: 'select', options: LOCALITIES.map(place => ({ value: place, label: place })), hint: 'Listed for the demo only; not a coverage map.' },
        { name: 'note', label: 'Delivery note', kind: 'textarea', optional: true, maxLength: 200, rows: 3, hint: 'For example, a gate colour or nearby landmark.' },
      ],
    },
  ],
  empty: () => ({ fulfilment: null, branch: null, name: null, phone: null, email: null, address: null, locality: null, note: null }),
  sample: () => ({ fulfilment: 'delivery', branch: 'kyanja', ...SAMPLE_PERSON, address: 'Plot 12, Sample Lane', locality: 'Kyanja', note: 'Sample note: green gate.' }),
  review: { title: 'Review your demo order', intro: 'Check everything below. Each section can be edited, and so can the basket.' },
  final: { label: 'Complete demo order', note: 'Demo only: no order is placed, no payment is taken and nothing is reserved.' },
  done: { title: 'Demo complete', body: '' },
}

