export function SkeletonLoader() {
  return (
    <div className="w-full max-w-2xl p-6 mx-auto bg-white border border-neutral-200 rounded-xl shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse shrink-0" />
        
        {/* Content skeleton */}
        <div className="flex-1 space-y-4 py-1">
          {/* Header */}
          <div className="h-4 bg-neutral-200 rounded w-1/4 animate-pulse" />
          
          {/* Body lines */}
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-4/6 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
