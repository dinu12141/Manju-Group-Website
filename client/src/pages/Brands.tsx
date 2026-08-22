import { Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { STATIC_BRANDS } from "@/lib/staticData";

const BRAND_VISUALS = {
  "dew-motors": {
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=90",
    gradient: "from-emerald-900/90 to-emerald-700/60",
    accentColor: "#10b981",
    tagline: "Power Your Ride. Go Electric.",
    description:
      "Sri Lanka's #1 electric bike brand. High-torque motors, long-range batteries, zero fuel cost.",
    stats: [
      { v: "80km", l: "Max Range" },
      { v: "70km/h", l: "Top Speed" },
      { v: "12mo", l: "Warranty" },
    ],
    products: ["EM005 2400W", "YW06 2000W", "EM003 Scooter"],
  },
  "dew-plus": {
    image:
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1400&q=90",
    gradient: "from-blue-900/90 to-blue-700/60",
    accentColor: "#3b82f6",
    tagline: "Crystal Clear. Stunningly Beautiful.",
    description:
      "4K UHD Android Smart TVs with HDR10, Dolby Audio, and built-in streaming apps.",
    stats: [
      { v: '32"–65"', l: "Screen Sizes" },
      { v: "4K UHD", l: "Resolution" },
      { v: "24mo", l: "Warranty" },
    ],
    products: ['32" Smart TV', '43" 4K TV', '55" Premium TV'],
  },
  "dew-plus-ac": {
    image:
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1400&q=90",
    gradient: "from-cyan-900/90 to-cyan-700/60",
    accentColor: "#06b6d4",
    tagline: "Cool Comfort. Smart Savings.",
    description:
      "Inverter split ACs with R32 eco-refrigerant. Cool faster, use 40% less electricity.",
    stats: [
      { v: "1–2 Ton", l: "Capacity" },
      { v: "40%", l: "Energy Saving" },
      { v: "5yr", l: "Compressor" },
    ],
    products: ["1 Ton Inverter", "1.5 Ton Inverter", "2 Ton Inverter"],
  },
  "manju-dew-super": {
    image:
      "https://images.unsplash.com/photo-1548186277-8eb4d5e2fc0f?auto=format&fit=crop&w=1400&q=90",
    gradient: "from-teal-900/90 to-teal-700/60",
    accentColor: "#14b8a6",
    tagline: "Pure Water. Healthy Family.",
    description:
      "Advanced RO+UV+UF purification delivering clean, mineral-rich water for every Sri Lankan home.",
    stats: [
      { v: "7-Stage", l: "Filtration" },
      { v: "99.9%", l: "Pure Water" },
      { v: "1yr", l: "Service" },
    ],
    products: ["RO Purifier", "Hot & Cold Dispenser", "Commercial RO Plant"],
  },
} as const;

export default function Brands() {
  const { data: brandsData, isLoading } = trpc.brands.list.useQuery();
  const brands =
    brandsData && brandsData.length > 0 ? brandsData : STATIC_BRANDS;

  return (
    <MainLayout>
      {/* Page hero */}
      <div className="bg-[#0F2D5E] py-16 text-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">
              Our Brand Portfolio
            </span>
            <h1 className="text-4xl sm:text-5xl font-black font-display mb-4">
              Five Brands. One Promise.
            </h1>
            <p className="text-white/70 max-w-xl mx-auto text-sm leading-relaxed">
              Manju Group brings together 5 premium brands covering every
              essential for the modern Sri Lankan home and lifestyle.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Brand cards */}
      <div className="bg-gray-50">
        {isLoading && !brands.length ? (
          <div className="container py-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          brands.map((brand, i) => {
            if (!brand) return null;
            const v = BRAND_VISUALS[brand.slug as keyof typeof BRAND_VISUALS];
            if (!v) return null;
            const isEven = i % 2 === 0;
            return (
              <div
                key={brand.id}
                className={isEven ? "bg-white py-4" : "bg-gray-50 py-4"}
              >
                <div className="container">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="relative h-72 rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
                  >
                    {/* Background image */}
                    <img
                      src={v.image}
                      alt={brand.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${v.gradient}`}
                    />
                    {/* Content */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="container flex items-center justify-between">
                        {/* Left: Text */}
                        <div className="max-w-lg">
                          <div className="inline-flex items-center gap-2 mb-3">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: v.accentColor }}
                            />
                            <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
                              {brand.name}
                            </span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
                            {v.tagline}
                          </h2>
                          <p className="text-white/75 text-sm mb-5 leading-relaxed max-w-sm hidden sm:block">
                            {v.description}
                          </p>
                          {/* Stats row */}
                          <div className="flex items-center gap-5 mb-5">
                            {v.stats.map(s => (
                              <div key={s.l}>
                                <div className="text-xl font-black text-white">
                                  {s.v}
                                </div>
                                <div className="text-white/55 text-xs">
                                  {s.l}
                                </div>
                              </div>
                            ))}
                          </div>
                          <Link href={`/brands/${brand.slug}`}>
                            <button className="bg-[#F85606] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#e04d00] transition-colors shadow-lg">
                              Shop {brand.name} &rarr;
                            </button>
                          </Link>
                        </div>
                        {/* Right: Product chips */}
                        <div className="hidden lg:flex flex-col gap-2">
                          {v.products.map(p => (
                            <div
                              key={p}
                              className="bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-medium px-4 py-2 rounded-full"
                            >
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#0F2D5E] py-14 text-white text-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-black mb-2">
              Can't decide? Browse everything.
            </h2>
            <p className="text-white/60 text-sm mb-6">
              View our complete product catalog across all 5 brands
            </p>
            <Link href="/products">
              <button className="bg-[#F85606] text-white px-8 py-3 rounded-full font-bold hover:bg-[#e04d00] transition-colors">
                View All Products &rarr;
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
