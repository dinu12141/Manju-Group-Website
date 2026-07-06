import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Grid3X3, List, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function parseSearch(search: string) {
  const params = new URLSearchParams(search.replace("?", ""));
  return {
    brandId: params.get("brandId") ? Number(params.get("brandId")) : undefined,
    categoryId: params.get("categoryId") ? Number(params.get("categoryId")) : undefined,
    search: params.get("search") || undefined,
    isFeatured: params.get("isFeatured") === "true" ? true : undefined,
    isBestSeller: params.get("isBestSeller") === "true" ? true : undefined,
  };
}

export default function Products() {
  const [location] = useLocation();
  const queryParams = parseSearch(typeof window !== "undefined" ? window.location.search : "");

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "popular">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>(queryParams.brandId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(queryParams.categoryId);
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

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Brand</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedBrandId(undefined)}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!selectedBrandId ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            All Brands
          </button>
          {brands?.map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrandId(brand.id)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${selectedBrandId === brand.id ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="bg-gray-50 border-b border-gray-100 py-8">
        <div className="container">
          <div className="text-xs text-gray-400 mb-1">
            <span className="hover:text-navy cursor-pointer" onClick={() => window.location.href = "/"}>Home</span>
            {" / "}
            <span className="text-gray-600">Products</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">
            {queryParams.search ? `Search: "${queryParams.search}"` :
             queryParams.isFeatured ? "Featured Products" :
             queryParams.isBestSeller ? "Best Sellers" :
             selectedBrandId && brands ? brands.find(b => b.id === selectedBrandId)?.name + " Products" :
             "All Products"}
          </h1>
          {data && (
            <p className="text-sm text-gray-500 mt-1">{data.total} products found</p>
          )}
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-6">
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-24">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {/* Mobile Filter */}
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden flex items-center gap-2">
                    <SlidersHorizontal size={15} /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-4">
                  <h2 className="font-semibold text-gray-800 mb-4">Filters</h2>
                  <FilterPanel />
                </SheetContent>
              </Sheet>

              {/* Active filters */}
              {selectedBrandId && brands && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-navy/10 text-navy rounded-full text-xs font-medium">
                  {brands.find(b => b.id === selectedBrandId)?.name}
                  <button onClick={() => setSelectedBrandId(undefined)}>
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="ml-auto flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-40 h-9 text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition-colors ${viewMode === "grid" ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors ${viewMode === "list" ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100">
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
                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}>
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
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = i + 1;
                      return (
                        <Button
                          key={p}
                          variant={page === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(p)}
                          className={page === p ? "bg-navy text-white" : ""}
                        >
                          {p}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => { setSelectedBrandId(undefined); setSelectedCategoryId(undefined); }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
