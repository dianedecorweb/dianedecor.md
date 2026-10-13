import { Link } from '@/i18n/client'

/** `items` is ordered from the homepage down; the last entry is the current page. */
export default function Breadcrumbs({ items, label }) {
  return (
    <nav aria-label={label} className="text-xs tracking-[0.14em] text-muted uppercase">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={item.href} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-ink-soft">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center transition-colors duration-200 ease-out hover:text-accent-deep"
                >
                  {item.label}
                </Link>
              )}
              {isLast ? null : <span aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
