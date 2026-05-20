export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-white/10 bg-black/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-9 w-32 animate-pulse rounded-lg bg-white/10" />
          <div className="flex gap-2">
            <div className="h-8 w-24 animate-pulse rounded-md bg-white/10" />
            <div className="h-8 w-20 animate-pulse rounded-md bg-white/10" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-80 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </div>
    </div>
  )
}
