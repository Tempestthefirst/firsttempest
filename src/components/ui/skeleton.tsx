import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted/50", className)} {...props} />;
}

// Pre-built skeleton patterns
function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

function RoomCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}

function BalanceCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export { Skeleton, TransactionSkeleton, RoomCardSkeleton, BalanceCardSkeleton };
