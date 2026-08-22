import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardSkeletonProps {
  variant?: "grid" | "list" | "compact";
}

export default function ProductCardSkeleton({
  variant = "grid",
}: ProductCardSkeletonProps) {
  if (variant === "compact") {
    return (
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="p-2 space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl">
        <Skeleton className="w-32 h-32 flex-shrink-0 rounded-lg" />
        <div className="flex-1 min-w-0 space-y-2 py-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="w-10 h-10 rounded-xl self-center flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden h-full flex flex-col">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-3 flex flex-col flex-1 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-20 mt-1" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-full mt-auto rounded-lg" />
      </div>
    </div>
  );
}
