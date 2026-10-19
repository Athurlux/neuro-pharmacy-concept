import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { isVisible, joinChoices, reviewSections, splitChoices, type Draft, type Errors, type FieldSpec, type FlowSpec, type StageSpec } from './engine'
import { DONE, REVIEW, useFormFlow, type FlowOptions } from './useFormFlow'
import type { Completion } from './FormsContext'
import { kampalaToday } from '../lib/validation'
import { Icon } from '../components/Icon'
import { DemoDocument } from '../components/Bits'

interface FormFlowProps<T extends Draft> extends FlowOptions<T> {
  flow: FlowSpec<T>
  /** Rendered beside every input stage and the review, e.g. a live order summary. */
  aside?: (draft: T, step: string) => ReactNode
  /** Rendered under a stage's fields. */
  stageExtra?: (draft: T, stageId: string) => ReactNode
  /** Shown above the review sections, e.g. the basket being reviewed. */
  reviewLead?: (draft: T) => ReactNode
  /** Links offered after an in-page completion besides "Start again". */
  doneLinks?: { label: string; to: string }[]
  restartLabel?: string
}

export function FormFlow<T extends Draft>({ flow, aside, stageExtra, reviewLead, doneLinks = [], restartLabel = 'Start a new enquiry', ...options }: FormFlowProps<T>) {
  const form = useFormFlow(flow, options)
  const { draft, stages, step, stageIndex, errors, completion, headingRef } = form
  const labels = Object.fromEntries(flow.stages.flatMap(stage => stage.fields.map(field => [field.name, field.label])).concat((flow.groups ?? []).map(group => [group.id, 'Contact details'])))

  if (step === DONE) {
    return completion ? (
      <section className="flow flow--done" aria-labelledby="flow-done-title" data-anim="done">
        <img className="flow__done-art" src="/states/demo-complete.svg" alt="" width={120} height={87} />
        <p className="flow__ref">Demo reference <strong>{completion.reference}</strong></p>
        <h2 className="flow__title" id="flow-done-title" ref={headingRef} tabIndex={-1}>{flow.done.title}</h2>
        <p className="notice notice--demo"><strong>Demonstration only.</strong> {flow.done.body}</p>
        <Summary sections={completion.sections} meta={completion.meta} />
        <div className="button-row no-print">
          <button type="button" className="button button--primary" onClick={form.reset}>{restartLabel}</button>
          <button type="button" className="button button--outline" onClick={() => window.print()}><Icon name="print" size={18} /> Print summary</button>
          {doneLinks.map(link => <Link key={link.to} to={link.to} className="button button--ghost">{link.label}</Link>)}
        </div>
        <p className="fine-print">This summary is held in memory for this visit only and disappears if you refresh.</p>
      </section>
    ) : (
      <section className="flow flow--done" aria-labelledby="flow-done-title">
        <h2 className="flow__title" id="flow-done-title" ref={headingRef} tabIndex={-1}>There’s no summary to show.</h2>
        <p>Demo summaries exist only in memory during a visit, so they disappear after a refresh or when this page is opened from a link. Nothing was sent anywhere.</p>
        <div className="button-row">
          <button type="button" className="button button--primary" onClick={form.reset}>Start again</button>
          <Link to="/" className="button button--outline">Go to the homepage</Link>
        </div>
      </section>
    )
  }

  const stepIds = [...stages.map(stage => stage.id), REVIEW]
  const currentIndex = stepIds.indexOf(step)
  const side = aside?.(draft, step)

  return (
    <div className={`flow ${side ? 'flow--with-aside' : ''}`}>
      <ol className="steps" aria-label="Progress">
        {stepIds.map((id, index) => {
          const title = id === REVIEW ? 'Review' : stages[index].title
          const state = index === currentIndex ? 'current' : index < currentIndex ? 'done' : 'todo'
          return (
            <li key={id} className={`steps__item is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              {state === 'done' ? (
                <button type="button" onClick={() => form.goTo(id)}><span className="steps__num"><Icon name="check" size={13} /></span><span className="steps__label">{title}</span><span className="visually-hidden"> (completed, edit)</span></button>
              ) : (
                <span><span className="steps__num">{index + 1}</span><span className="steps__label">{title}</span></span>
              )}
            </li>
          )
        })}
      </ol>

      <div className="flow__body">
        <div className="flow__main" data-anim="step" key={step}>
          {step === REVIEW ? (
            <section aria-labelledby="flow-review-title">
              <h2 className="flow__title" id="flow-review-title" ref={headingRef} tabIndex={-1}>{flow.review.title}</h2>
              <p className="flow__intro">{flow.review.intro}</p>
              {reviewLead?.(draft)}
              <Summary sections={reviewSections(flow, draft)} onEdit={id => form.goTo(id)} />
              <FinalAction label={flow.final.label} note={flow.final.note} blocked={form.blocked} onComplete={form.complete} />
              <div className="flow__actions flow__actions--review">
                <button type="button" className="button button--ghost" onClick={form.back}><Icon name="back" size={18} /> Back</button>
                <ClearForm onClear={form.reset} />
              </div>
            </section>
          ) : (
            <form noValidate onSubmit={event => { event.preventDefault(); form.next() }} aria-labelledby="flow-stage-title">
              <div className="flow__head">
                <h2 className="flow__title" id="flow-stage-title" ref={headingRef} tabIndex={-1}>{stages[stageIndex].title}</h2>
                <button type="button" className="button button--small button--outline" onClick={form.useSample}>Use sample details</button>
              </div>
              {stages[stageIndex].intro && <p className="flow__intro">{stages[stageIndex].intro}</p>}
              <ErrorSummary errors={errors} labels={labels} />
              <StageFields flow={flow} stage={stages[stageIndex]} draft={draft} errors={errors} update={form.update} />
              {stageExtra?.(draft, stages[stageIndex].id)}
              <div className="flow__actions">
                {stageIndex > 0
                  ? <button type="button" className="button button--ghost" onClick={form.back}><Icon name="back" size={18} /> Back</button>
                  : <ClearForm onClear={form.reset} />}
                <button type="submit" className="button button--primary">
                  {stageIndex === stages.length - 1 ? 'Review' : 'Next'}
                </button>
              </div>
              <p className="fine-print">Your answers stay in this browser tab only. They are not saved or sent, and refreshing the page clears them.</p>
            </form>
          )}
        </div>
        {side && <aside className="flow__aside" aria-label="Summary">{side}</aside>}
      </div>
    </div>
  )
}

function StageFields<T extends Draft>({ flow, stage, draft, errors, update }: { flow: FlowSpec<T>; stage: StageSpec<T>; draft: T; errors: Errors; update: (patch: Partial<T>) => void }) {
  const visible = stage.fields.filter(field => isVisible(field, draft))
  const groups = (flow.groups ?? []).filter(group => group.fields.some(name => visible.some(field => field.name === name)))
  const grouped = new Set(groups.flatMap(group => group.fields))
  const rendered = new Set<string>()
  const items: ReactNode[] = []

  for (const field of visible) {
    if (grouped.has(field.name)) {
      const group = groups.find(item => item.fields.includes(field.name))!
      if (rendered.has(group.id)) continue
      rendered.add(group.id)
      items.push(
        <fieldset key={group.id} id={group.id} tabIndex={-1} className={`field-group field--wide ${errors[group.id] ? 'is-invalid' : ''}`} aria-describedby={errors[group.id] ? `${group.id}-error` : `${group.id}-hint`}>
          <legend className="field__label">{group.legend}</legend>
          <p className="field__hint" id={`${group.id}-hint`}>{group.hint}</p>
          <div className="form-grid form-grid--nested">
            {group.fields.map(name => {
              const member = visible.find(item => item.name === name)
              return member ? <FieldControl key={name} field={member} draft={draft} error={errors[name]} update={update} /> : null
            })}
          </div>
          {errors[group.id] && <p className="field__error" id={`${group.id}-error`}>{errors[group.id]}</p>}
        </fieldset>,
      )
    } else {
      items.push(<FieldControl key={field.name} field={field} draft={draft} error={errors[field.name]} update={update} />)
    }
  }
  return <div className="form-grid">{items}</div>
}

function FieldControl<T extends Draft>({ field, draft, error, update }: { field: FieldSpec<T>; draft: T; error?: string; update: (patch: Partial<T>) => void }) {
  const id = field.name
  const value = draft[field.name]
  const text = value ?? ''
  const describedBy = [field.hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
  const set = (next: string | null) => update({ [field.name]: next } as Partial<T>)
  const wide = field.wide || field.kind === 'textarea' || field.kind === 'radio'
  const common = { id, name: id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy }
  const legend = <legend className="field__label">{field.label}{field.optional && <span className="field__optional"> (optional)</span>}</legend>

  if (field.kind === 'radio' || field.kind === 'checkboxes') {
    const multi = field.kind === 'checkboxes'
    const chosen = multi ? splitChoices(value) : [text]
    const toggle = (choice: string) => set(multi ? joinChoices(chosen.includes(choice) ? chosen.filter(item => item !== choice) : [...chosen, choice]) : choice)
    return (
      <fieldset id={id} tabIndex={-1} className={`field choice-group field--wide ${error ? 'is-invalid' : ''}`} aria-describedby={describedBy}>
        {legend}
        {field.hint && <p className="field__hint" id={`${id}-hint`}>{field.hint}</p>}
        <div className="choice-group__options">
          {field.options!.map(option => (
            <label key={option.value} className={`choice ${multi ? 'choice--check' : ''} ${chosen.includes(option.value) ? 'is-selected' : ''}`}>
              <input type={multi ? 'checkbox' : 'radio'} name={id} value={option.value} checked={chosen.includes(option.value)} onChange={() => toggle(option.value)} />
              <span className="choice__text">
                <span className="choice__label">{option.label}</span>
                {option.description && <span className="choice__description">{option.description}</span>}
              </span>
            </label>
          ))}
        </div>
        {error && <p className="field__error" id={`${id}-error`}>{error}</p>}
      </fieldset>
    )
  }

  if (field.kind === 'document') {
    return (
      <fieldset id={id} tabIndex={-1} className={`field field--wide ${error ? 'is-invalid' : ''}`} aria-describedby={describedBy}>
        {legend}
        {field.hint && <p className="field__hint" id={`${id}-hint`}>{field.hint}</p>}
        <DemoDocument selected={text === field.options?.[0]?.value} onSelect={() => set(field.options![0].value)} onRemove={() => set(null)} />
        {error && <p className="field__error" id={`${id}-error`}>{error}</p>}
      </fieldset>
    )
  }

  let control: ReactNode
  if (field.kind === 'textarea') {
    control = <textarea {...common} className="input input--textarea" rows={field.rows ?? 4} maxLength={field.maxLength} value={text} onChange={event => set(event.target.value)} />
  } else if (field.kind === 'select' || field.kind === 'time') {
    control = (
      <select {...common} className="input input--select" value={text} onChange={event => set(event.target.value)}>
        <option value="">Choose…</option>
        {field.options!.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    )
  } else {
    const bounds = field.kind === 'date' ? field.dateBounds?.(kampalaToday()) : undefined
    control = (
      <input
        {...common}
        className="input"
        type={field.kind === 'number' ? 'text' : field.kind}
        inputMode={field.kind === 'number' ? 'numeric' : field.kind === 'tel' ? 'tel' : undefined}
        autoComplete={field.autoComplete ?? 'off'}
        placeholder={field.placeholder}
        min={bounds?.min}
        max={bounds?.max}
        maxLength={field.maxLength}
        value={text}
        onChange={event => set(event.target.value)}
      />
    )
  }

  return (
    <div className={`field ${wide ? 'field--wide' : ''} ${error ? 'is-invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>{field.label}{field.optional && <span className="field__optional"> (optional)</span>}</label>
      {field.hint && <p className="field__hint" id={`${id}-hint`}>{field.hint}</p>}
      {control}
      {field.maxLength && field.kind === 'textarea' && <p className="field__count" aria-hidden="true">{text.length} / {field.maxLength}</p>}
      {error && <p className="field__error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}

export function Summary({ sections, meta = [], onEdit }: { sections: Completion['sections']; meta?: Completion['meta']; onEdit?: (stageId: string) => void }) {
  return (
    <div className="summary">
      {meta.length > 0 && (
        <dl className="summary__meta">
          {meta.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
        </dl>
      )}
      {sections.map(section => (
        <section key={section.stageId} className="summary__section" aria-labelledby={`summary-${section.stageId}`}>
          <div className="summary__head">
            <h3 id={`summary-${section.stageId}`}>{section.title}</h3>
            {onEdit && (
              <button type="button" className="text-button" onClick={() => onEdit(section.stageId)}>
                <Icon name="edit" size={15} /> Edit<span className="visually-hidden"> {section.title}</span>
              </button>
            )}
          </div>
          <dl className="summary__list">
            {section.entries.map(entry => (
              <div key={entry.name}>
                <dt>{entry.label}</dt>
                <dd className={entry.value === 'Not provided' ? 'is-empty' : undefined}>{entry.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

/** Disabled after the first press, so a double click cannot complete twice. */
function FinalAction({ label, note, blocked, onComplete }: { label: string; note: string; blocked: string | null; onComplete: () => boolean }) {
  const [busy, setBusy] = useState(false)
  return (
    <div className="final-action">
      {blocked && <p className="final-action__blocked" role="alert">{blocked}</p>}
      <button type="button" className="button button--primary button--large" disabled={busy} aria-describedby="final-note" onClick={() => { setBusy(true); if (!onComplete()) setBusy(false) }}>
        {label}
      </button>
      <p className="final-action__note" id="final-note">{note}</p>
    </div>
  )
}

function ClearForm({ onClear }: { onClear: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (confirming) confirmRef.current?.focus() }, [confirming])
  if (!confirming) return <button type="button" className="text-button" onClick={() => setConfirming(true)}>Clear form</button>
  return (
    <div className="confirm-inline" role="group" aria-label="Confirm clearing the form">
      <span>Clear every answer?</span>
      <button ref={confirmRef} type="button" className="button button--small button--danger" onClick={() => { setConfirming(false); onClear() }}>Yes, clear</button>
      <button type="button" className="button button--small button--ghost" onClick={() => setConfirming(false)}>Keep</button>
    </div>
  )
}

export function ErrorSummary({ errors, labels }: { errors: Errors; labels: Record<string, string> }) {
  const entries = Object.entries(errors)
  if (!entries.length) return null
  return (
    <div className="error-summary" role="alert" aria-labelledby="error-summary-title">
      <h3 className="error-summary__title" id="error-summary-title">Please check {entries.length === 1 ? 'one detail' : `${entries.length} details`}</h3>
      <ul>
        {entries.map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`} onClick={event => {
              event.preventDefault()
              const target = document.getElementById(field)
              const focusable = target?.matches('fieldset') ? target.querySelector<HTMLElement>('input, select, textarea, button') : target
              focusable?.focus()
              target?.scrollIntoView({ block: 'center' })
            }}>{labels[field] ? `${labels[field]}: ` : ''}{message}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
