import { cn } from '@/lib/utils'

const fieldClasses =
  'h-12 w-full rounded-none border-0 border-b border-field-line bg-transparent px-0 text-ink outline-none transition-[border-color,border-width] duration-200 ease-out placeholder:text-muted focus:border-b-2 focus:border-accent aria-[invalid=true]:border-b-2 aria-[invalid=true]:border-danger'

export function FieldLabel({ htmlFor, children, optional = false }) {
  return (
    <label htmlFor={htmlFor} className="eyebrow block">
      {children}
      {optional ? null : <span aria-hidden="true"> *</span>}
    </label>
  )
}

/** Lămurire sub un câmp, pentru reguli care nu se ghicesc din etichetă. */
export function FieldHint({ id, children }) {
  return (
    <p id={id} className="mt-2 text-sm text-muted">
      {children}
    </p>
  )
}

export function FieldError({ id, children }) {
  if (!children) return null

  return (
    <p id={id} className="mt-2 text-sm text-danger">
      {children}
    </p>
  )
}

export default function Input({ className, ...props }) {
  return <input className={cn(fieldClasses, className)} {...props} />
}

export { fieldClasses }
