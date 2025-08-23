export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted animate-pulse rounded" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 bg-muted animate-pulse rounded" />
        <div className="h-80 bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}
