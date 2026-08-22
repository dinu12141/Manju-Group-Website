import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  PackageSearch,
  ChevronRight,
  Sparkles,
  Zap,
  Tv,
  Wind,
  Droplets,
  ShoppingBag,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import ProductCard from "@/components/ProductCard";
import { STATIC_PRODUCTS, STATIC_BRANDS } from "@/lib/staticData";
import { cleanText } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import FilterPanel, { type FilterState } from "@/components/FilterPanel";
import ActiveFilterChips from "@/components/ActiveFilterChips";

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

const DEFAULT_FILTERS: FilterState = {
  inStockOnly: false,
  bestSellersOnly: false,
  newArrivalsOnly: false,
};

const CATEGORY_ICONS: Record<string, any> = {
  "electric-bikes": Zap,
  "smart-tvs": Tv,
  "air-conditioners": Wind,
  "water-filters": Droplets,
};

export default function Products() {
  const [_location] = useLocation();
  const searchString = useSearch();
  const queryParams = parseSearch(searchString);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "newest" | "price_asc" | "price_desc" | "popular"
  >("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    brandId: queryParams.brandId,
    categoryId: queryParams.categoryId,
  });

  // Queries
  const { data: brandsData } = trpc.brands.list.useQuery();
  const { data: categoriesData } = trpc.categories.list.useQuery();

  const brands = useMemo(() => {
    if (brandsData && brandsData.length > 0) return brandsData;
    return STATIC_BRANDS;
  }, [brandsData]);

  const categories = useMemo(() => {
    if (categoriesData && categoriesData.length > 0) return categoriesData;
    return [
      { id: 1, name: "Electric Bikes", slug: "electric-bikes" },
      { id: 2, name: "Smart TVs", slug: "smart-tvs" },
      { id: 3, name: "Air Conditioners", slug: "air-conditioners" },
      { id: 4, name: "Water Filters", slug: "water-filters" },
    ];
  }, [categoriesData]);

  const { data, isLoading } = trpc.products.list.useQuery({
    page,
    limit: 12,
    brandId: filters.brandId,
    categoryId: filters.categoryId,
    minPrice: filters.priceRange ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange ? filters.priceRange[1] : undefined,
    inStockOnly: filters.inStockOnly || undefined,
    isBestSeller: filters.bestSellersOnly || queryParams.isBestSeller,
    isNew: filters.newArrivalsOnly || undefined,
    isFeatured: queryParams.isFeatured,
    search: queryParams.search,
    sortBy,
  });

  // Instant fallback to STATIC_PRODUCTS so the UI never displays empty skeletons or 0 products
  const filteredStaticProducts = useMemo(() => {
    let list = [...STATIC_PRODUCTS];
    if (filters.brandId) {
      list = list.filter(p => p.brandId === Number(filters.brandId));
    }
    if (filters.categoryId) {
      list = list.filter(p => p.categoryId === Number(filters.categoryId));
    }
    if (filters.priceRange) {
      list = list.filter(
        p =>
          Number(p.basePrice) >= filters.priceRange![0] &&
          Number(p.basePrice) <= filters.priceRange![1]
      );
    }
    if (filters.bestSellersOnly || queryParams.isBestSeller) {
      list = list.filter(p => p.isBestSeller);
    }
    if (queryParams.isFeatured) {
      list = list.filter(p => p.isFeatured);
    }
    if (queryParams.search && queryParams.search.trim()) {
      const term = queryParams.search.trim().toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }
    if (sortBy === "price_asc") {
      list.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
    } else if (sortBy === "popular") {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }
    return list;
  }, [filters, queryParams, sortBy]);

  const productsToShow =
    data && data.items && data.items.length > 0
      ? (data.items as any)
      : filteredStaticProducts.slice((page - 1) * 12, page * 12);

  const totalCount =
    data && data.total && data.total > 0
      ? data.total
      : filteredStaticProducts.length;

  const totalPages = Math.max(1, Math.ceil(totalCount / 12));

  const hasActiveFilters = Boolean(
    filters.brandId ||
      filters.categoryId ||
      filters.priceRange ||
      filters.inStockOnly ||
      filters.bestSellersOnly ||
      filters.newArrivalsOnly
  );

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      brandId: queryParams.brandId,
      categoryId: queryParams.categoryId,
    }));
    setPage(1);
  }, [searchString]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortBy, queryParams.search]);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const handleRemoveChip = (key: keyof FilterState) => {
    if (
      key === "inStockOnly" ||
      key === "bestSellersOnly" ||
      key === "newArrivalsOnly"
    ) {
      setFilters(f => ({ ...f, [key]: false }));
    } else {
      setFilters(f => ({ ...f, [key]: undefined }));
    }
  };

  const selectedCategory = categories.find(c => c.id === filters.categoryId);
  const selectedBrand = brands.find(b => b.id === filters.brandId);

  const pageTitle = queryParams.search
    ? `Search Results for "${queryParams.search}"`
    : queryParams.isFeatured
      ? "Featured Products"
      : queryParams.isBestSeller
        ? "Best Selling Products"
        : selectedBrand
          ? `${cleanText(selectedBrand.name)} Collection`
          : selectedCategory
            ? `${cleanText(selectedCategory.name)}`
            : "All Products";

  const filterKey = `${filters.brandId ?? "all"}-${filters.categoryId ?? "all"}-${filters.priceRange?.join("-") ?? "any"}-${filters.inStockOnly}-${filters.bestSellersOnly}-${filters.newArrivalsOnly}-${viewMode}-${page}`;

  const pageNumbers = useMemo(() => {
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
  }, [totalPages, page]);

  return (
    <MainLayout>
      {/* ── Page Header Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0F2D5E] text-white py-12 md:py-16">
        {/* Subtle Background Glow & Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F85606]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-1.5 text-xs text-blue-200/80 mb-4"
            aria-label="Breadcrumb"
          >
            <span
              className="hover:text-white transition-colors cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              Home
            </span>
            <ChevronRight size={12} className="text-blue-300/50" />
            <span
              className="hover:text-white transition-colors cursor-pointer"
              onClick={() => (window.location.href = "/products")}
            >
              Products
            </span>
            {selectedCategory && (
              <>
                <ChevronRight size={12} className="text-blue-300/50" />
                <span className="text-white font-medium">
                  {cleanText(selectedCategory.name)}
                </span>
              </>
            )}
          </nav>

          {/* Heading + Total count */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F85606] text-xs font-bold uppercase tracking-wider mb-2.5 border border-white/10">
                <Sparkles size={12} className="text-orange-400" />
                Manju Group Catalog
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-display text-white">
                {pageTitle}
              </h1>
              <p className="text-blue-100/80 text-sm md:text-base mt-2 max-w-xl">
                Explore genuine multi-brand electric bikes, 4K smart TVs,
                inverter ACs, and water purification systems with manufacturer
                warranty.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-sm font-semibold text-white">
                <ShoppingBag size={15} className="text-orange-400" />
                <span className="font-bold">{totalCount}</span> Products Found
              </span>
            </div>
          </div>

          {/* Category Visual Filter Pills */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setFilters(f => ({ ...f, categoryId: undefined }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filters.categoryId === undefined
                  ? "bg-[#F85606] text-white shadow-lg shadow-orange-500/30 scale-102"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
            >
              <ShoppingBag size={14} />
              All Categories
            </button>

            {categories.map(cat => {
              const IconComp =
                (cat.slug && CATEGORY_ICONS[cat.slug]) || ShoppingBag;
              const isActive = filters.categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setFilters(f => ({
                      ...f,
                      categoryId: isActive ? undefined : cat.id,
                    }))
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#F85606] text-white shadow-lg shadow-orange-500/30 scale-102"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  }`}
                >
                  <IconComp size={14} />
                  {cleanText(cat.name)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Main Catalog Body ─────────────────────────────────────────── */}
      <section className="bg-gray-50/70 py-8 md:py-12 min-h-screen">
        <div className="container">
          <div className="flex gap-8 items-start">
            {/* ── Desktop Filter Sidebar ──────────────────────── */}
            <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 text-slate-900">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200">
                  <span className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <SlidersHorizontal size={16} className="text-[#0F2D5E]" />
                    Filter Catalog
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                <FilterPanel
                  brands={brands}
                  categories={categories}
                  filters={filters}
                  onFilterChange={setFilters}
                  onClear={clearFilters}
                />
              </div>
            </aside>

            {/* ── Product Listings & Controls ──────────────────── */}
            <div className="flex-1 min-w-0 text-slate-900">
              {/* Toolbar */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                {/* Mobile Filter Button */}
                <button
                  className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <SlidersHorizontal size={14} className="text-[#0F2D5E]" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-[#F85606]" />
                  )}
                </button>

                {/* Showing count */}
                <span className="text-xs text-slate-700 font-medium hidden sm:inline-block">
                  Showing{" "}
                  <strong className="text-slate-900 font-bold">
                    {productsToShow.length}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-900 font-bold">
                    {totalCount}
                  </strong>{" "}
                  products
                </span>

                {/* Sort + Layout Toggle */}
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-700 font-bold hidden md:inline">
                      Sort:
                    </span>
                    <Select
                      value={sortBy}
                      onValueChange={v => setSortBy(v as typeof sortBy)}
                    >
                      <SelectTrigger className="w-44 h-9 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-900 shadow-xs hover:border-slate-400">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 text-slate-900 rounded-xl shadow-xl z-50">
                        <SelectItem
                          value="newest"
                          className="text-slate-900 font-semibold hover:bg-slate-100 cursor-pointer"
                        >
                          Newest First
                        </SelectItem>
                        <SelectItem
                          value="price_asc"
                          className="text-slate-900 font-semibold hover:bg-slate-100 cursor-pointer"
                        >
                          Price: Low to High
                        </SelectItem>
                        <SelectItem
                          value="price_desc"
                          className="text-slate-900 font-semibold hover:bg-slate-100 cursor-pointer"
                        >
                          Price: High to Low
                        </SelectItem>
                        <SelectItem
                          value="popular"
                          className="text-slate-900 font-semibold hover:bg-slate-100 cursor-pointer"
                        >
                          Most Popular
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Grid / List Switcher */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setViewMode("grid")}
                      aria-label="Grid view"
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-white text-[#0F2D5E] shadow-xs font-bold"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Grid3X3 size={15} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      aria-label="List view"
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === "list"
                          ? "bg-white text-[#0F2D5E] shadow-xs font-bold"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <List size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips Row */}
              {hasActiveFilters && (
                <div className="mb-5">
                  <ActiveFilterChips
                    filters={filters}
                    brands={brands}
                    categories={categories}
                    onRemove={handleRemoveChip}
                    onClear={clearFilters}
                  />
                </div>
              )}

              {/* ── Product Grid / List ──────────────────────────── */}
              {isLoading && productsToShow.length === 0 ? (
                /* Skeleton Loader */
                <div
                  className={`grid gap-5 ${
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden p-4 flex flex-col gap-3 animate-pulse"
                    >
                      <div className="aspect-[4/3] bg-gray-100 rounded-xl" />
                      <div className="h-4 bg-gray-100 rounded-md w-1/3" />
                      <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                      <div className="h-6 bg-gray-100 rounded-md w-1/2 mt-auto" />
                    </div>
                  ))}
                </div>
              ) : productsToShow.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={filterKey}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`grid gap-3.5 sm:gap-4 ${
                        viewMode === "grid"
                          ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                          : "grid-cols-1"
                      }`}
                    >
                      {productsToShow.map((product: any, i: number) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: Math.min(i * 0.04, 0.3),
                            duration: 0.35,
                          }}
                        >
                          <ProductCard {...product} variant={viewMode} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination>
                        <PaginationContent className="bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={e => {
                                e.preventDefault();
                                if (page > 1) {
                                  setPage(p => p - 1);
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }
                              }}
                              aria-disabled={page === 1}
                              className={
                                page === 1
                                  ? "pointer-events-none opacity-30"
                                  : "cursor-pointer hover:bg-gray-100 rounded-xl"
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
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                  className={`rounded-xl font-bold cursor-pointer transition-all ${
                                    page === p
                                      ? "bg-[#0F2D5E] text-white shadow-sm hover:bg-[#0F2D5E]"
                                      : "hover:bg-gray-100 text-gray-700"
                                  }`}
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
                                if (page < totalPages) {
                                  setPage(p => p + 1);
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }
                              }}
                              aria-disabled={page === totalPages}
                              className={
                                page === totalPages
                                  ? "pointer-events-none opacity-30"
                                  : "cursor-pointer hover:bg-gray-100 rounded-xl"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                /* ── Empty State ─────────────────────────────── */
                <div className="bg-white border border-gray-200/80 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto my-12">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F85606] mb-4">
                    <PackageSearch size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No Matching Products Found
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm">
                    We couldn&apos;t find any products matching your active
                    filters. Try broadening your criteria or reset filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0F2D5E] hover:bg-[#1a4a8a] transition-all shadow-sm"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Filter Drawer Modal ─────────────────────────────── */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xs h-full bg-white shadow-2xl p-6 overflow-y-auto flex flex-col z-10"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <span className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#0F2D5E]" />
                  Filters
                </span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1">
                <FilterPanel
                  brands={brands}
                  categories={categories}
                  filters={filters}
                  onFilterChange={setFilters}
                  onClear={clearFilters}
                />
              </div>

              <div className="pt-4 border-t border-gray-100 mt-6">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-[#0F2D5E] hover:bg-[#1a4a8a] shadow-sm"
                >
                  Apply Filters ({totalCount} Products)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
