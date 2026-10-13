import { Link } from '@/i18n/client'
import { cn } from '@/lib/utils'

/**
 * Plain links, not client state: the filter lives in the URL, survives a hard
 * refresh, is shareable, and works with JavaScript disabled.
 */
export default function CategoryFilter({ categories, activeSlug, t }) {
  const options = [{ name: t.common.all, slug: null }, ...categories]

  return (
    <nav aria-label={t.portfolio.filterAria}>
      <ul className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {options.map((option) => {
          const isActive = (option.slug ?? null) === (activeSlug ?? null)

          return (
            <li key={option.slug ?? 'toate'} className="snap-start">
              <Link
                href={option.slug ? `/portofoliu/categorie/${option.slug}` : '/portofoliu'}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'inline-flex h-11 items-center rounded-[3px] border px-4 text-sm whitespace-nowrap transition-colors duration-200 ease-out',
                  isActive
                    ? 'border-ink bg-ink text-ivory'
                    : 'border-line text-ink-soft hover:border-ink hover:text-ink'
                )}
              >
                {option.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
