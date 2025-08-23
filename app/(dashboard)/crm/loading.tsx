export default function CRMLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted animate-pulse rounded" />
      <div className="flex gap-4">
        <div className="h-10 bg-muted animate-pulse rounded flex-1 max-w-sm" />
        <div className="h-10 bg-muted animate-pulse rounded w-40" />
        <div className="h-10 bg-muted animate-pulse rounded w-32" />
      </div>
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
}
