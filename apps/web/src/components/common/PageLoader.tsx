import { CardSkeleton } from "./Skeleton";

export function PageLoader() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading page">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded-lg bg-dark-700/50" />
          <div className="h-3 w-56 animate-pulse rounded-lg bg-dark-700/50" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
