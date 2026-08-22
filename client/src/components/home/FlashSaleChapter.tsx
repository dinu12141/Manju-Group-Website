import { Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

export default function FlashSaleChapter() {
  const { data } = trpc.products.list.useQuery({ limit: 6, isFeatured: true });
  const products = data?.items ?? [];

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-6 border-b border-gray-100">
      <div className="container">
        {/* Header strip */}
        <div className="flex items-center justify-between bg-[#F85606] rounded-t-xl px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-lg">🔥 Flash Sale</span>
            <span className="text-white/80 text-sm">
              Ends in:{" "}
              <span className="font-mono font-bold text-white">02:45:30</span>
            </span>
          </div>
          <Link href="/products?isFeatured=true">
            <span className="text-white/90 text-sm font-semibold hover:text-white transition-colors cursor-pointer">
              View All →
            </span>
          </Link>
        </div>

        {/* Product row */}
        <div className="border border-t-0 border-gray-100 rounded-b-xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(products as React.ComponentProps<typeof ProductCard>[]).map(
              (product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05,
                    ease: "easeOut" as const,
                  }}
                >
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    brandName={product.brandName}
                    basePrice={product.basePrice}
                    salePrice={product.salePrice}
                    imageUrl={product.imageUrl}
                    isInStock={product.isInStock}
                    isBestSeller={product.isBestSeller}
                    isNew={product.isNew}
                    isFeatured={product.isFeatured}
                  />
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
