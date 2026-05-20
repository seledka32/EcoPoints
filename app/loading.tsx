import { Spinner } from '@/components/ui/spinner'

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
      <Spinner className="size-8 text-emerald-400" />
      <p className="text-sm">Загрузка…</p>
    </div>
  )
}
