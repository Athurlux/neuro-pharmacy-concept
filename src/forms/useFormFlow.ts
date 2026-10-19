import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  activeStages, createReference, firstIncompleteIndex, pruneHidden, reviewSections, validateStage, type Draft, type Errors, type FlowSpec,
} from './engine'
import { useForms, type Completion } from './FormsContext'
import { kampalaToday } from '../lib/validation'

export const REVIEW = 'review'
export const DONE = 'done'

/** Resolves which step a visitor may see; a direct link cannot skip validation. */
export function resolveStep<T extends Draft>(flow: FlowSpec<T>, draft: T, requested: string | null, now = new Date()) {
  const ids = [...activeStages(flow, draft).map(stage => stage.id), REVIEW]
  if (requested === DONE) return DONE
  const allowed = firstIncompleteIndex(flow, draft, now)
  const index = Math.max(0, ids.indexOf(requested ?? ids[0]))
  return ids[Math.min(index, allowed)]
}

const isBlank = (value: unknown) => value === null || value === undefined || (typeof value === 'string' && !value.trim())

export interface FlowOptions<T extends Draft> {
  instanceKey?: string
  referencePrefix: string
  meta?: Completion['meta']
  /** Values carried in from elsewhere (a chosen branch); they fill empty fields only. */
  prefill?: Partial<T>
  /** Returns a reason completion must not happen right now, e.g. an empty basket. */
  blockCompletion?: (draft: T) => string | null
  /** Extra completion data derived from the final draft, e.g. a basket snapshot. */
  extra?: (draft: T) => Partial<Completion>
  /** Runs once after a completion is recorded, e.g. emptying the basket. */
  afterComplete?: (completion: Completion) => void
  /** When set, completion navigates to this route instead of the in-page done step. */
  doneRoute?: (reference: string) => string
}

export function useFormFlow<T extends Draft>(flow: FlowSpec<T>, options: FlowOptions<T>) {
  const key = options.instanceKey ?? flow.key
  const { drafts, completions, setDraft, setCompletion } = useForms()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const stored = (drafts[key] as T | undefined) ?? flow.empty()
  const draft = { ...stored }
  for (const [name, value] of Object.entries(options.prefill ?? {})) {
    if (isBlank(draft[name]) && !isBlank(value)) (draft as Draft)[name] = value as string
  }
  const stages = activeStages(flow, draft)
  const completion = completions[key] ?? null
  const requested = params.get('step')
  const step = resolveStep(flow, draft, requested)
  const stageIndex = stages.findIndex(stage => stage.id === step)
  const [errors, setErrors] = useState<Errors>({})
  const [attempted, setAttempted] = useState<Record<string, boolean>>({})
  const [blocked, setBlocked] = useState<string | null>(null)
  const completing = useRef(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Keep the URL honest when a later step was requested before earlier ones are valid.
  useEffect(() => {
    if (step === DONE) completing.current = false
    if (completing.current) return // the draft was just cleared; the navigation to DONE is pending
    if (requested && requested !== step) setParams(current => { const next = new URLSearchParams(current); next.set('step', step); return next }, { replace: true })
  }, [requested, step, setParams])

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    setErrors({})
    setBlocked(null)
    // Scroll to the step heading rather than the page top: some flows sit part-way down a page.
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.scrollIntoView({ block: 'start' })
  }, [step])

  const goTo = useCallback((id: string, replace = false) => {
    setParams(current => { const next = new URLSearchParams(current); next.set('step', id); return next }, { replace })
  }, [setParams])

  const update = (patch: Partial<T>) => {
    const next = { ...draft, ...patch } as T
    setDraft(key, next)
    const stage = stages[stageIndex]
    if (stage && attempted[stage.id]) setErrors(validateStage(stage, next))
  }

  const focusFirstError = (found: Errors) => {
    const first = Object.keys(found)[0]
    requestAnimationFrame(() => {
      const target = document.getElementById(first)
      const focusable = target?.matches('fieldset') ? target.querySelector<HTMLElement>('input, select, textarea, button') : target
      focusable?.focus()
      target?.scrollIntoView({ block: 'center' })
    })
  }

  const next = () => {
    const stage = stages[stageIndex]
    if (!stage) return
    const found = validateStage(stage, draft)
    setAttempted(value => ({ ...value, [stage.id]: true }))
    setErrors(found)
    if (Object.keys(found).length) return focusFirstError(found)
    // Carried-in values become part of the saved draft once a step is accepted.
    setDraft(key, draft)
    goTo(stages[stageIndex + 1]?.id ?? REVIEW)
  }

  const back = () => {
    if (step === REVIEW) return goTo(stages[stages.length - 1].id)
    if (stageIndex > 0) goTo(stages[stageIndex - 1].id)
  }

  // Sample details fill only empty fields, so values carried in from elsewhere (a
  // preferred branch, an item typed on the homepage) are never overwritten.
  const useSample = () => {
    const sample = flow.sample(kampalaToday()) as Partial<T>
    const filled = { ...draft }
    for (const name of Object.keys(sample) as (keyof T)[]) {
      if (isBlank(draft[name])) filled[name] = sample[name] as T[keyof T]
    }
    setDraft(key, filled)
    setErrors({})
  }

  const complete = () => {
    if (completing.current) return false
    const incomplete = firstIncompleteIndex(flow, draft)
    if (incomplete < stages.length) { goTo(stages[incomplete].id); return false }
    const reason = options.blockCompletion?.(draft) ?? null
    setBlocked(reason)
    if (reason) return false
    completing.current = true
    const reference = createReference(options.referencePrefix)
    const record: Completion = {
      reference,
      createdAt: new Date().toISOString(),
      sections: reviewSections(flow, pruneHidden(flow, draft)),
      meta: options.meta ?? [],
      ...options.extra?.(draft),
    }
    setCompletion(key, record)
    // The draft is cleared once its summary exists, so personal details are not
    // kept in two places and Back cannot resubmit the same answers.
    setDraft(key, null)
    options.afterComplete?.(record)
    // Replace the review entry, so Back from the confirmation cannot resubmit.
    if (options.doneRoute) navigate(options.doneRoute(reference), { replace: true })
    else goTo(DONE, true)
    return true
  }

  const reset = () => {
    setDraft(key, null)
    setCompletion(key, null)
    setErrors({})
    setAttempted({})
    setBlocked(null)
    goTo(stages[0]?.id ?? flow.stages[0].id, true)
  }

  return { key, draft, stages, step, stageIndex, errors, blocked, completion, headingRef, update, next, back, goTo, useSample, complete, reset }
}
