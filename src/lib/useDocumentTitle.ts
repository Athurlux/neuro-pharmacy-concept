import { useEffect } from 'react'

const SITE = 'Neuro Pharmacy (independent concept)'
const DEFAULT_DESCRIPTION = 'An independent website concept for Neuro Pharmacy: find a branch, ask about an item, and try a demo shop with delivery or collection. Not the official website; forms send nothing.'

export function useDocumentTitle(title: string | null, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} · Your neighbourhood pharmacy`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
