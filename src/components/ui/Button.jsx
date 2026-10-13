import { Link } from '@/i18n/client'
import { cn } from '@/lib/utils'

const base =
  'inline-flex h-12 items-center justify-center gap-2 rounded-[3px] px-7 text-sm font-medium tracking-[0.02em] transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60'

const variants = {
  primary: 'bg-ink text-ivory hover:bg-accent-deep',
  secondary: 'border border-ink text-ink hover:bg-ink hover:text-ivory',
  light: 'border border-ivory/70 text-ivory hover:bg-ivory hover:text-ink',
  inverse: 'bg-ivory text-ink hover:bg-accent hover:text-ivory',
  ghost:
    'group h-auto min-h-11 rounded-none px-0 py-2 text-ink hover:text-accent-deep relative inline-flex flex-col items-start',
}

/**
 * Renders an <a> when `href` is set and a <button> otherwise, so callers never
 * have to think about which element they need.
 */
export default function Button({
  href,
  variant = 'primary',
  fullWidth = false,
  className,
  children,
  ...props
}) {
  const classes = cn(base, variants[variant], fullWidth && 'w-full', className)

  const content =
    variant === 'ghost' ? (
      <>
        <span className="inline-flex items-center gap-2">{children}</span>
        <span className="mt-1 block h-px w-0 bg-accent-deep transition-[width] duration-200 ease-out group-hover:w-full group-focus-visible:w-full" />
      </>
    ) : (
      children
    )

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  )
}
