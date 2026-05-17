import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

// ─── Skeleton placeholders ────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }): React.JSX.Element {
  return (
    <div className={`animate-pulse rounded-xl bg-brand-gray-100 ${className ?? ""}`} />
  )
}

function CarCardSkeleton(): React.JSX.Element {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-gray-100 bg-brand-white shadow-sm">
      <SkeletonBlock className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-6 w-40" />
        <div className="flex gap-3">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
        <div className="mt-auto flex justify-between">
          <div className="flex flex-col gap-1">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-7 w-28" />
          </div>
          <SkeletonBlock className="h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function CarsLoading(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* StepProgressBar skeleton */}
        <SkeletonBlock className="h-32 w-full" />

        {/* Trip summary skeleton */}
        <SkeletonBlock className="h-14 w-full" />

        {/* Car grid skeleton */}
        <section>
          <SkeletonBlock className="mb-6 h-8 w-56" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CarCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
