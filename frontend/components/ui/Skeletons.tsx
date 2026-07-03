import { cn } from '@/lib/utils';

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('luxury-card rounded-xl overflow-hidden', className)}>
      <div className="shimmer h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="shimmer h-5 w-3/4 rounded" />
        <div className="shimmer h-4 w-1/2 rounded" />
        <div className="flex gap-2 mt-2">
          <div className="shimmer h-6 w-16 rounded-full" />
          <div className="shimmer h-6 w-16 rounded-full" />
          <div className="shimmer h-6 w-16 rounded-full" />
        </div>
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-5/6 rounded" />
        <div className="flex gap-2 mt-3">
          <div className="shimmer h-9 flex-1 rounded-lg" />
          <div className="shimmer h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-4 rounded-xl border border-border/60', className)}>
      <div className="shimmer h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="shimmer h-4 w-1/3 rounded" />
        <div className="shimmer h-3 w-2/3 rounded" />
      </div>
      <div className="shimmer h-8 w-20 rounded-lg" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="luxury-card rounded-xl p-5 space-y-3">
      <div className="flex justify-between">
        <div className="shimmer h-4 w-28 rounded" />
        <div className="shimmer h-8 w-8 rounded-lg" />
      </div>
      <div className="shimmer h-8 w-20 rounded" />
      <div className="shimmer h-3 w-32 rounded" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="shimmer h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}

export function RoomDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="shimmer h-72 md:h-96 w-full rounded-xl" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="shimmer h-7 w-3/4 rounded" />
          <div className="shimmer h-4 w-1/2 rounded" />
          <div className="shimmer h-24 w-full rounded" />
          <div className="shimmer h-48 w-full rounded" />
        </div>
        <div className="space-y-4">
          <div className="shimmer h-32 w-full rounded-xl" />
          <div className="shimmer h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
