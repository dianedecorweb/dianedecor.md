import Container from '@/components/layout/Container'
import Skeleton, { ServiceRowSkeleton } from '@/components/ui/Skeleton'

export default function ServicesLoading() {
  return (
    <Container className="pt-16 pb-24 md:pt-20">
      <p className="sr-only" role="status">
        Se încarcă...
      </p>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-3/4 max-w-xl" />
        <Skeleton className="h-3 w-full max-w-2xl" />
      </div>

      <div className="mt-16 flex flex-col gap-16">
        {Array.from({ length: 3 }).map((_, index) => (
          <ServiceRowSkeleton key={index} />
        ))}
      </div>
    </Container>
  )
}
