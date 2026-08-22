import { AnimatePresence, motion } from "framer-motion";
import { PackageSearch } from "lucide-react";
import ProductCard, { type ProductCardProps } from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

interface ProductGridProps {
  products: ProductCardProps[];
  isLoading?: boolean;
  skeletonCount?: number;
  variant?: "grid" | "list";
  columns?: 2 | 3 | 4;
  emptyState?: React.ReactNode;
  className?: string;
}

const colsClass: Record<2 | 3 | 4, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

function DefaultEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
      <PackageSearch size={48} strokeWidth={1.5} />
      <p className="text-sm font-medium">No products found</p>
    </div>
  );
}

export default function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  variant = "grid",
  columns = 4,
  emptyState,
  className = "",
}: ProductGridProps) {
  if (variant === "list") {
    return (
      <div className={`space-y-3 ${className}`}>
        {isLoading ? (
          Array.from({ length: skeletonCount }).map((_, i) => (
            <ProductCardSkeleton key={i} variant="list" />
          ))
        ) : products.length === 0 ? (
          (emptyState ?? <DefaultEmpty />)
        ) : (
          <AnimatePresence mode="popLayout">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <ProductCard {...p} variant="list" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${colsClass[columns]} gap-4 ${className}`}
    >
      {isLoading ? (
        Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} variant="grid" />
        ))
      ) : products.length === 0 ? (
        <div className="col-span-full">{emptyState ?? <DefaultEmpty />}</div>
      ) : (
        <AnimatePresence mode="popLayout">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <ProductCard {...p} variant="grid" />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
