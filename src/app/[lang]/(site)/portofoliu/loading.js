import Container from '@/components/layout/Container'
import Skeleton, { ProjectCardSkeleton } from '@/components/ui/Skeleton'

export default function PortfolioLoading() {
  return (
    <Container className="pt-16 pb-24 md:pt-20">
      <p className="sr-only" role="status">
        Se încarcă...
      </p>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-3/4 max-w-xl" />
        <Skeleton className="h-3 w-full max-w-2xl" />
      </div>

      <div className="mt-10 flex gap-2 border-y border-line py-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-28 shrink-0" />
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 md:mt-14">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    </Container>
  )
}
