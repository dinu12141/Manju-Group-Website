import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { BRAND_META } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function Brands() {
  const { data: brands, isLoading } = trpc.brands.list.useQuery();

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-navy to-[#1a4a8a] py-14 text-white">
        <div className="container text-center">
          <div className="text-amber text-xs font-bold uppercase tracking-wider mb-2">
            Our Portfolio
          </div>
          <h1 className="text-4xl font-bold font-display mb-3">Our Brands</h1>
          <p className="text-white/70 max-w-xl mx-auto text-sm leading-relaxed">
            Five distinct brands, one unified commitment to quality. Explore
            Manju Group's portfolio of trusted products for every Sri Lankan
            home.
          </p>
        </div>
      </div>

      <div className="container py-14">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands?.map((brand, i) => {
              const meta = BRAND_META[brand.slug] || {
                bgGradient: "from-navy to-navy-light",
                icon: "🏷️",
                emoji: "🏷️",
              };
              return (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/brands/${brand.slug}`}>
                    <div
                      className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${meta.bgGradient} p-6 h-64 flex flex-col justify-between cursor-pointer group`}
                    >
                      <div className="absolute right-4 top-4 text-7xl opacity-15 group-hover:opacity-25 transition-opacity">
                        {meta.emoji}
                      </div>
                      <div>
                        <div className="text-4xl mb-3">{meta.icon}</div>
                        <h2 className="text-xl font-bold text-white font-display">
                          {brand.name}
                        </h2>
                        {brand.tagline && (
                          <p className="text-white/70 text-sm mt-1">
                            {brand.tagline}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">
                          {brand.description?.slice(0, 60)}...
                        </span>
                        <div className="flex items-center gap-1 text-white text-sm font-semibold group-hover:gap-2 transition-all">
                          Explore <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
