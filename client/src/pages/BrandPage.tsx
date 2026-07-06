import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Package, PackageX, Frown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import ProductCard from "@/components/ProductCard";
import { BRAND_META } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

interface BrandPageProps {
  params: { slug: string };
}

export default function BrandPage({ params }: BrandPageProps) {
  const { slug } = params;
  const [page, setPage] = useState(1);
  const meta = BRAND_META[slug] || {
    bgGradient: "from-navy to-navy-light",
    icon: "🏷️",
    emoji: "🏷️",
    color: "#0F2D5E",
  };

  const { data: brand, isLoading: brandLoading } = trpc.brands.bySlug.useQuery({
    slug,
  });
  const { data: productsData, isLoading: productsLoading } =
    trpc.products.list.useQuery(
      { brandId: brand?.id, page, limit: 12, sortBy: "newest" },
      { enabled: !!brand?.id }
    );

  if (brandLoading) {
    return (
      <MainLayout>
        <Skeleton className="h-64 w-full" />
        <div className="container py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!brand) {
    return (
      <MainLayout>
        <div className="container py-20">
          <EmptyState
            icon={<Frown size={28} />}
            title="Brand Not Found"
            description="The brand you're looking for doesn't exist or may have been removed."
            action={
              <Link href="/brands">
                <Button className="bg-navy text-white">View All Brands</Button>
              </Link>
            }
          />
        </div>
      </MainLayout>
    );
  }

  const totalPages = productsData ? Math.ceil(productsData.total / 12) : 0;

  return (
    <MainLayout>
      {/* Brand Hero */}
      <div
        className={`bg-gradient-to-br ${meta.bgGradient} py-16 relative overflow-hidden`}
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center opacity-10 text-[200px]">
          {meta.emoji}
        </div>
        <div className="container relative z-10">
          <div className="text-xs text-white/50 mb-4 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white/80">
              Home
            </Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-white/80">
              Brands
            </Link>
            <span>/</span>
            <span className="text-white/80">{brand.name}</span>
          </div>
          <div className="text-5xl mb-4">{meta.icon}</div>
          <h1 className="text-4xl font-bold text-white font-display mb-2">
            {brand.name}
          </h1>
          {brand.tagline && (
            <p className="text-white/80 text-lg mb-4">{brand.tagline}</p>
          )}
          {brand.description && (
            <p className="text-white/60 max-w-xl text-sm leading-relaxed">
              {brand.description}
            </p>
          )}
          <div className="flex gap-3 mt-6">
            <Link href={`/products?brandId=${brand.id}`}>
              <Button className="bg-white text-navy hover:bg-white/90 font-semibold flex items-center gap-2">
                <Package size={16} /> All Products <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 font-display">
            {brand.name} Products
            {productsData && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({productsData.total} items)
              </span>
            )}
          </h2>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden border border-gray-100"
              >
                <Skeleton className="aspect-product w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : productsData && productsData.items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {productsData.items.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                    className={page === i + 1 ? "bg-navy text-white" : ""}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<PackageX size={28} />}
            title="No products available yet"
            description={`Check back soon for new arrivals from ${brand.name}.`}
          />
        )}
      </div>
    </MainLayout>
  );
}
