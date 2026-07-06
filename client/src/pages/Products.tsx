import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  PackageSearch,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

function parseSearch(search: string) {
  const params = new URLSearchParams(search.replace("?", ""));
  return {
    brandId: params.get("brandId") ? Number(params.get("brandId")) : undefined,
    categoryId: params.get("categoryId")
      ? Number(params.get("categoryId"))
      : undefined,
    search: params.get("search") || undefined,
    isFeatured: params.get("isFeatured") === "true" ? true : undefined,
    isBestSeller: params.get("isBestSeller") === "true" ? true : undefined,
  };
}

export default function Products() {
  const [location] = useLocation();
  const queryParams = parseSearch(
    typeof window !== "undefined" ? window.location.search : ""
  );

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "newest" | "price_asc" | "price_desc" | "popular"
  >("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>(
    queryParams.brandId
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(queryParams.categoryId);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: brands } = trpc.brands.list.useQuery();

  const { data, isLoading } = trpc.products.list.useQuery({
    page,
    limit: 12,
    brandId: selectedBrandId,
    categoryId: selectedCategoryId,
    search: queryParams.search,
    sortBy,
    isFeatured: queryParams.isFeatured,
    isBestSeller: queryParams.isBestSeller,
  });

  const totalPages = data ? Math.ceil(data.total / 12) : 0;
  const hasActiveFilters = Boolean(selectedBrandId || selectedCategoryId);

  useEffect(() => {
    setPage(1);
  }, [selectedBrandId, selectedCategoryId, sortBy, queryParams.search]);

  const clearFilters = () => {
    setSelectedBrandId(undefined);
    setSelectedCategoryId(undefined);
  };

  // Build a compact page-number list with ellipses for larger page counts.
  const pageNumbers = (() => {
    if (totalPages <= 1) return [];
    const items: (number | "ellipsis")[] = [];
    const add = (n: number) => items.push(n);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
      return items;
    }
    add(1);
    if (page > 3) items.push("ellipsis");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      add(i);
    if (page < totalPages - 2) items.push("ellipsis");
    add(totalPages);
    return items;
  })();

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Brand</h3>
        <div className="space-y-1">
          <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Checkbox
              checked={!selectedBrandId}
              onCheckedChange={() => setSelectedBrandId(undefined)}
            />
            <span
              className={`text-sm ${!selectedBrandId ? "text-navy font-medium" : "text-gray-600"}`}
            >
              All Brands
            </span>
          </label>
          {brands?.map(brand => (
            <label
              key={brand.id}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                checked={selectedBrandId === brand.id}
                onCheckedChange={checked =>
                  setSelectedBrandId(checked ? brand.id : undefined)
                }
              />
              <span
                className={`text-sm ${selectedBrandId === brand.id ? "text-navy font-medium" : "text-gray-600"}`}
              >
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full justify-center gap-1.5 text-gray-600"
        >
          <X size={14} /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="bg-gray-50 border-b border-gray-100 py-8">
        <div className="container">
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <span
              className="hover:text-navy cursor-pointer transition-colors"
              onClick={() => (window.location.href = "/")}
            >
              Home
            </span>
            <ChevronRight size={12} />
            <span className="text-gray-600">Products</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">
            {queryParams.search
              ? `Search: "${queryParams.search}"`
              : queryParams.isFeatured
                ? "Featured Products"
                : queryParams.isBestSeller
                  ? "Best Sellers"
                  : selectedBrandId && brands
                    ? brands.find(b => b.id === selectedBrandId)?.name +
                      " Products"
                    : "All Products"}
          </h1>
          {data && (
            <p className="text-sm text-gray-500 mt-1">
              Showing{" "}
              <span className="font-medium text-gray-700">
                {data.items.length}
              </span>{" "}
              of <span className="font-medium text-gray-700">{data.total}</span>{" "}
              products
            </p>
          )}
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-6">
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="card-surface p-4 sticky top-24">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="card-surface flex items-center gap-3 mb-6 p-3 flex-wrap">
              {/* Mobile Filter */}
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden flex items-center gap-2"
                  >
                    <SlidersHorizontal size={15} /> Filters
                    {hasActiveFilters && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="border-b border-gray-100">
                    <SheetTitle className="flex items-center gap-2">
                      <SlidersHorizontal size={16} /> Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-4 overflow-y-auto">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Active filters */}
              {selectedBrandId && brands && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-navy/10 text-navy rounded-full text-xs font-medium">
                  {brands.find(b => b.id === selectedBrandId)?.name}
                  <button
                    onClick={() => setSelectedBrandId(undefined)}
                    aria-label="Remove brand filter"
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="ml-auto flex items-center gap-2">
                <Select
                  value={sortBy}
                  onValueChange={v => setSortBy(v as typeof sortBy)}
                >
                  <SelectTrigger className="w-44 h-9 text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price_desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                    className={`p-2 transition-colors ${viewMode === "grid" ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                    className={`p-2 transition-colors ${viewMode === "list" ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div
                className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card-surface overflow-hidden">
                    <Skeleton className="aspect-product w-full" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data && data.items.length > 0 ? (
              <>
                <div
                  className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}
                >
                  {data.items.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <ProductCard {...product} variant={viewMode} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-10">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={e => {
                            e.preventDefault();
                            if (page > 1) setPage(p => p - 1);
                          }}
                          aria-disabled={page === 1}
                          className={
                            page === 1
                              ? "pointer-events-none opacity-40"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {pageNumbers.map((p, idx) =>
                        p === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${idx}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={page === p}
                              onClick={e => {
                                e.preventDefault();
                                setPage(p);
                              }}
                              className={
                                page === p
                                  ? "bg-navy text-white border-navy hover:bg-navy hover:text-white cursor-pointer"
                                  : "cursor-pointer"
                              }
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={e => {
                            e.preventDefault();
                            if (page < totalPages) setPage(p => p + 1);
                          }}
                          aria-disabled={page === totalPages}
                          className={
                            page === totalPages
                              ? "pointer-events-none opacity-40"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <EmptyState
                icon={<PackageSearch />}
                title="No products found"
                description="Try adjusting your filters or search terms to find what you're looking for."
                action={
                  hasActiveFilters ? (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="gap-1.5"
                    >
                      <X size={14} /> Clear Filters
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
