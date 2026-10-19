import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Draft, ReviewSection } from './engine'

export interface OrderSnapshot {
  lines: { id: string; name: string; qty: number; unitPrice: number; lineTotal: number }[]
  itemCount: number
  subtotal: number
  fee: number
  total: number
  fulfilment: 'delivery' | 'collection'
  branch: string
}

export interface Completion {
  reference: string
  createdAt: string
  sections: ReviewSection[]
  /** Extra context shown above the summary, e.g. the chosen branch. */
  meta: { label: string; value: string }[]
  /** Checkout completions carry a snapshot of the basket and totals as reviewed. */
  order?: OrderSnapshot
}

interface FormsValue {
  drafts: Record<string, Draft>
  completions: Record<string, Completion>
  setDraft: (key: string, draft: Draft | null) => void
  setCompletion: (key: string, completion: Completion | null) => void
}

const FormsContext = createContext<FormsValue | null>(null)

/**
 * Drafts and completed previews live only in React memory. They survive moving
 * between pages, and disappear on refresh — nothing is written to storage,
 * placed in a URL or sent anywhere.
 */
export function FormsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [completions, setCompletions] = useState<Record<string, Completion>>({})

  const setDraft = useCallback((key: string, draft: Draft | null) => {
    setDrafts(current => {
      const next = { ...current }
      if (draft) next[key] = draft
      else delete next[key]
      return next
    })
  }, [])

  const setCompletion = useCallback((key: string, completion: Completion | null) => {
    setCompletions(current => {
      const next = { ...current }
      if (completion) next[key] = completion
      else delete next[key]
      return next
    })
  }, [])

  const value = useMemo(() => ({ drafts, completions, setDraft, setCompletion }), [drafts, completions, setDraft, setCompletion])
  return <FormsContext.Provider value={value}>{children}</FormsContext.Provider>
}

export function useForms() {
  const value = useContext(FormsContext)
  if (!value) throw new Error('useForms must be used inside FormsProvider')
  return value
}
