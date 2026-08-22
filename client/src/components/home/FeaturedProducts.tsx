import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard, { type ProductCardProps } from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

const SKELETON_COUNT = 8;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    },
  },
};

export default function FeaturedProducts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const { data, isLoading } = trpc.products.getFeatured.useQuery();
  const products = data ?? [];

  return (
    <section ref={sectionRef} className="py-20">
      <div className="container">
        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <div>
            <span className="section-label">Best Sellers</span>
            <h2 className="section-title">Top Picks for You</h2>
          </div>
          <Link href="/products">
            <motion.a
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold cursor-pointer"
              style={{ color: "var(--color-green-light)" }}
              whileHover={{ gap: "0.625rem" }}
              transition={{ duration: 0.2 }}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </Link>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ProductCardSkeleton key={i} variant="grid" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {(products as ProductCardProps[]).map(product => (
              <motion.div key={product.id} variants={cardVariants}>
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
                  variant="grid"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile View All */}
        <div className="flex justify-center mt-10 sm:hidden">
          <Link href="/products">
            <motion.a
              className="btn-outline-green cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </motion.a>
          </Link>
        </div>

        {/* Desktop View All CTA */}
        {!isLoading && products.length > 0 && (
          <motion.div
            className="hidden sm:flex justify-center mt-12"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link href="/products">
              <motion.a
                className="btn-outline-green cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.a>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
