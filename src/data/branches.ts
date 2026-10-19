// Branch reference data for the concept. Public sources disagree and none confirms today's
// branch network, so every entry records how well it is supported and what is unknown.
// Sources were rechecked on 19 October 2026; see docs/CONTENT-NOTES.md for the full register.
//
// Deliberately absent: coordinates, map pins, opening hours, "open now", services such as
// drive-through or delivery coverage, payment methods, and clickable phone links.

export type BranchStatus = 'reference' | 'lead'

export interface ListedContact {
  value: string
  source: string
}

export interface Branch {
  slug: string
  /** Broad place name used in menus and forms. */
  name: string
  status: BranchStatus
  /** The location as the sources describe it, never more precise than they are. */
  locationNote: string
  sources: { label: string; detail: string }[]
  /** Numbers or addresses that appear in a source but have not been confirmed by the business. */
  listedContacts: ListedContact[]
  /** What would have to be confirmed before this could be published as a real branch. */
  toConfirm: string[]
}

export const STATUS_LABEL: Record<BranchStatus, string> = {
  reference: 'Listed location reference',
  lead: 'Provisional lead',
}

export const STATUS_EXPLAINED: Record<BranchStatus, string> = {
  reference: 'A public directory lists a Neuro Pharmacy at this location. The listing has not been confirmed with the business and may be out of date.',
  lead: 'Mentioned in social media text or supplied as a lead for this concept. No current public listing confirms it.',
}

const ALWAYS_CONFIRM = ['That the branch is currently operating', 'Opening hours', 'The correct phone number', 'Services offered at this branch']

export const BRANCHES: Branch[] = [
  {
    slug: 'kyanja',
    name: 'Kyanja',
    status: 'reference',
    locationNote: 'Komamboga Road, Kyanja area. One listing places it on the Kyanja–Kisasi Road near Kensington Estates; the exact site is not confirmed.',
    sources: [
      { label: 'Uganda Health Directory (Kyanja listing)', detail: 'Lists “Neuro Pharmacy – Kyanja”, Komamboga Road, Kyanja, as a general pharmacy.' },
      { label: 'Medpages', detail: 'Lists Neuro Pharmacy on Komamboga Road (filed under Nakawa). Last updated February 2023 and marked as being updated.' },
      { label: 'Pharmacy-branded Facebook page (search result text)', detail: 'Refers to Kyanja–Kisasi Road near Kensington Estates and Prime Fuel.' },
    ],
    listedContacts: [
      { value: '+256 700 598331', source: 'Uganda Health Directory' },
      { value: '+256 702 649920', source: 'Supplied for this concept; not found in a public listing' },
    ],
    toConfirm: [...ALWAYS_CONFIRM, 'Which of the two listed numbers is current'],
  },
  {
    slug: 'kanyanya',
    name: 'Kanyanya',
    status: 'reference',
    locationNote: 'Kanyanya–Bahai Road, at the Kampala Quality Primary School junction. A concept lead described “Kikaya/Bahai, opposite Kampala Quality”, which appears to be the same place.',
    sources: [
      { label: 'Uganda Health Directory 2025–26 (print edition, p. 224)', detail: 'Lists Neuro Pharmacy Limited at Kanyanya–Bahai Road, Kampala Quality Primary School junction.' },
    ],
    listedContacts: [
      { value: '+256 779 091829', source: 'Uganda Health Directory 2025–26' },
      { value: 'neuropharmaltd@gmail.com', source: 'Uganda Health Directory 2025–26' },
    ],
    toConfirm: [...ALWAYS_CONFIRM, 'Whether “Kikaya/Bahai” and this entry are one branch'],
  },
  {
    slug: 'bukoto',
    name: 'Bukoto',
    status: 'reference',
    locationNote: 'Ntinda Road, Bukoto, listed beside TMT Supermarket.',
    sources: [
      { label: 'Uganda Health Directory 2025–26 (print edition, p. 224)', detail: 'Lists Neuro Pharmacy Limited at Ntinda Road, TMT Supermarket, Bukoto.' },
    ],
    listedContacts: [
      { value: '+256 708 389041', source: 'Uganda Health Directory 2025–26' },
      { value: 'neuropharmaltd@gmail.com', source: 'Uganda Health Directory 2025–26' },
    ],
    toConfirm: ALWAYS_CONFIRM,
  },
  {
    slug: 'naguru',
    name: 'Naguru',
    status: 'lead',
    locationNote: 'Naguru. A concept lead places it opposite Kampala Parents School; no public listing confirms this.',
    sources: [
      { label: 'Indexed Facebook profile text', detail: 'Mentions Naguru.' },
      { label: 'Concept brief', detail: '“Naguru, opposite Kampala Parents.”' },
    ],
    listedContacts: [],
    toConfirm: [...ALWAYS_CONFIRM, 'The address'],
  },
  {
    slug: 'kira-bulindo',
    name: 'Kira–Bulindo',
    status: 'lead',
    locationNote: 'Bulindo, Kira. No public listing gives an address.',
    sources: [
      { label: 'Pharmacy-branded Facebook page (search result text)', detail: 'Mentions Kira/Bulindo.' },
    ],
    listedContacts: [{ value: '+256 750 547347', source: 'Supplied for this concept; not found in a public listing' }],
    toConfirm: [...ALWAYS_CONFIRM, 'The address'],
  },
  {
    slug: 'kawempe',
    name: 'Kawempe',
    status: 'lead',
    locationNote: 'Waliggo Road, Kawempe, as supplied for this concept. No public listing confirms it.',
    sources: [{ label: 'Concept brief', detail: '“Kawempe/Waliggo Road.”' }],
    listedContacts: [],
    toConfirm: [...ALWAYS_CONFIRM, 'The address'],
  },
]

export const findBranch = (slug: string | null | undefined) => BRANCHES.find(branch => branch.slug === slug)

/** Options for forms. "No preference" keeps every journey possible without choosing a branch. */
export const BRANCH_OPTIONS = [
  ...BRANCHES.map(branch => ({ value: branch.slug, label: branch.name, description: STATUS_LABEL[branch.status] })),
  { value: 'no-preference', label: 'No preference', description: 'Any branch that could help' },
]

export const branchLabel = (slug: string | null | undefined) =>
  slug === 'no-preference' ? 'No preference' : findBranch(slug)?.name ?? 'Not chosen'
