import { useSyncExternalStore } from 'react'
import { findBranch } from '../data/branches'

// The visitor's chosen branch, carried into enquiries and checkout. Memory only: it is
// not written to storage, so it is forgotten on refresh like every other form detail.
let current: string | null = null
const listeners = new Set<() => void>()

export function setPreferredBranch(slug: string | null) {
  current = slug === 'no-preference' || findBranch(slug) ? slug : null
  listeners.forEach(listener => listener())
}

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
export const usePreferredBranch = () => useSyncExternalStore(subscribe, () => current, () => null)
