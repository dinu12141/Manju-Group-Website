import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Battery,
  BookOpen,
  Award,
  Droplets,
  Frown,
  Leaf,
  MapPin,
  PackageX,
  Phone,
  ShieldCheck,
  Snowflake,
  Tv,
  Truck,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

interface BrandPageProps {
  params: { slug: string };
}

type BrandVisual = {
  heroImage: string;
  gradient: string;
  color: string;
  features: { icon: LucideIcon; title: string; desc: string }[];
  stats: { v: string; l: string }[];
  story: string;
  storyImage: string;
};

const BRAND_VISUALS: Record<string, BrandVisual> = {
  "dew-motors": {
    heroImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=90",
    gradient: "from-black/80 to-emerald-900/40",
    color: "#10b981",
    features: [
      {
        icon: Zap,
        title: "High-Torque Motor",
        desc: "Up to 2400W motor for smooth acceleration on any road.",
      },
      {
        icon: Battery,
        title: "Long-Range Battery",
        desc: "Ride up to 80km on a single charge.",
      },
      {
        icon: ShieldCheck,
        title: "12-Month Warranty",
        desc: "Full manufacturer warranty on all components.",
      },
    ],
    stats: [
      { v: "80km", l: "Max Range" },
      { v: "70km/h", l: "Top Speed" },
      { v: "3 Models", l: "Available" },
    ],
    story:
      "Since its inception, Dew Motors has been at the forefront of electric mobility in Sri Lanka. Our bikes are engineered for Sri Lankan roads — from Colombo's urban streets to coastal highways. With zero fuel costs and minimal maintenance, Dew Motors makes sustainable commuting affordable for everyone.",
    storyImage:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=700&q=85",
  },
  "dew-plus": {
    heroImage:
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1600&q=90",
    gradient: "from-black/80 to-blue-900/40",
    color: "#3b82f6",
    features: [
      {
        icon: Tv,
        title: "4K UHD Display",
        desc: "Crystal-clear 4K resolution with HDR10 support.",
      },
      {
        icon: Wifi,
        title: "Smart Android TV",
        desc: "Google TV with all streaming apps built-in.",
      },
      {
        icon: ShieldCheck,
        title: "2-Year Warranty",
        desc: "Panel & parts warranty for peace of mind.",
      },
    ],
    stats: [
      { v: '32"–65"', l: "Screen Sizes" },
      { v: "4K HDR", l: "Resolution" },
      { v: "3 Models", l: "Available" },
    ],
    story:
      "Dew Plus brings cinema-quality entertainment to every Sri Lankan home. Our Smart TVs combine stunning 4K displays with the power of Android TV, giving you access to YouTube, Netflix, and all your favourite apps right on the big screen.",
    storyImage:
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=700&q=85",
  },
  "dew-plus-ac": {
    heroImage:
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1600&q=90",
    gradient: "from-black/80 to-cyan-900/40",
    color: "#06b6d4",
    features: [
      {
        icon: Snowflake,
        title: "Inverter Technology",
        desc: "Variable speed compressor saves up to 40% electricity.",
      },
      {
        icon: Leaf,
        title: "Eco R32 Refrigerant",
        desc: "Environment-friendly refrigerant with zero ozone depletion.",
      },
      {
        icon: ShieldCheck,
        title: "5-Year Compressor",
        desc: "5-year compressor warranty + 1-year parts.",
      },
    ],
    stats: [
      { v: "1–2 Ton", l: "Capacity" },
      { v: "40%", l: "Energy Saved" },
      { v: "3 Models", l: "Available" },
    ],
    story:
      "DEW+ AC units are engineered for Sri Lanka's tropical climate. Our inverter technology ensures your home stays cool without skyrocketing electricity bills. With eco-friendly R32 refrigerant and quiet operation, DEW+ is the smart choice for the modern Sri Lankan home.",
    storyImage:
      "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?auto=format&fit=crop&w=700&q=85",
  },
  "manju-dew-super": {
    heroImage:
      "https://images.unsplash.com/photo-1548186277-8eb4d5e2fc0f?auto=format&fit=crop&w=1600&q=90",
    gradient: "from-black/80 to-teal-900/40",
    color: "#14b8a6",
    features: [
      {
        icon: Droplets,
        title: "7-Stage Filtration",
        desc: "RO+UV+UF removes 99.9% of contaminants.",
      },
      {
        icon: ShieldCheck,
        title: "Health Certified",
        desc: "NSF and WHO standard certified purification.",
      },
      {
        icon: Zap,
        title: "Hot & Cold Models",
        desc: "Instant hot and chilled water at your fingertips.",
      },
    ],
    stats: [
      { v: "99.9%", l: "Pure" },
      { v: "7-Stage", l: "Filtration" },
      { v: "2 Models", l: "Available" },
    ],
    story:
      "Clean water is a right, not a privilege. Manju Dew Super purifiers use the latest RO, UV, and UF technology to ensure every Sri Lankan family has access to pure, healthy water. Our purifiers remove heavy metals, bacteria, and viruses — leaving only clean, mineral-rich drinking water.",
    storyImage:
      "https://images.unsplash.com/photo-1563389938-b53ccad7f4e3?auto=format&fit=crop&w=700&q=85",
  },
};

export default function BrandPage({ params }: BrandPageProps) {
  const { slug } = params;
  const [page, setPage] = useState(1);

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
        <Skeleton className="h-[480px] w-full" />
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
                <Button className="bg-[#0F2D5E] text-white">
                  View All Brands
                </Button>
              </Link>
            }
          />
        </div>
      </MainLayout>
    );
  }

  const totalPages = productsData ? Math.ceil(productsData.total / 12) : 0;
  const visual = BRAND_VISUALS[slug];
  const heroImage = visual?.heroImage;
  const brandColor = visual?.color ?? "#0F2D5E";

  return (
    <MainLayout>
      {/* 1. BRAND HERO */}
      <div className="relative overflow-hidden" style={{ minHeight: "480px" }}>
        {heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${visual?.gradient ?? "from-black/80 to-[#0F2D5E]/40"}`}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 container py-20 flex flex-col justify-center"
          style={{ minHeight: "480px" }}
        >
          {/* Breadcrumb */}
          <div className="text-xs text-white/50 mb-8 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-white transition-colors">
              Brands
            </Link>
            <span>/</span>
            <span className="text-white/80">{brand.name}</span>
          </div>

          {/* Brand initial circle */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-6 shadow-lg"
            style={{ backgroundColor: brandColor }}
          >
            {brand.name.charAt(0)}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-px bg-[#C9A84C]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              Brand Collection
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white font-display mb-3 leading-tight max-w-2xl">
            {brand.name}
          </h1>

          {visual && (
            <p className="text-lg font-semibold text-white/80 mb-3 uppercase tracking-wider">
              {visual.stats[0].v} {visual.stats[0].l} &bull; {visual.stats[1].v}{" "}
              {visual.stats[1].l}
            </p>
          )}

          {brand.description && (
            <p className="text-white/70 max-w-xl text-sm leading-relaxed mb-8">
              {brand.description}
            </p>
          )}

          {/* Stats row */}
          {visual && (
            <div className="flex items-center gap-8 mb-8">
              {visual.stats.map(s => (
                <div key={s.l}>
                  <div className="text-2xl font-black text-white">{s.v}</div>
                  <div className="text-white/55 text-xs uppercase tracking-wider">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`/products?brandId=${brand.id}`}>
              <button className="bg-[#F85606] text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-[#e04d00] transition-colors shadow-lg flex items-center gap-2">
                Shop All {brand.name} <ArrowRight size={14} />
              </button>
            </Link>
            <a href="#products">
              <button className="border border-white/30 text-white px-7 py-3 rounded-full font-semibold text-sm hover:bg-white/10 transition-colors">
                Learn More &darr;
              </button>
            </a>
          </div>
        </motion.div>
      </div>

      {/* 2. BRAND FEATURES ROW */}
      {visual && (
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {visual.features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                      style={{ backgroundColor: brandColor }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800 mb-0.5">
                        {feat.title}
                      </div>
                      <div className="text-xs text-gray-700 font-medium leading-relaxed">
                        {feat.desc}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. PRODUCTS SECTION */}
      <div id="products" className="bg-gray-50 py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span
                className="text-xs font-bold uppercase tracking-widest mb-1 block"
                style={{ color: "#C9A84C" }}
              >
                Our Range
              </span>
              <h2 className="text-2xl font-black text-[#0F2D5E] font-display flex items-center gap-3">
                {brand.name} Products
                {productsData && (
                  <span className="text-sm font-semibold bg-[#0F2D5E] text-white px-2.5 py-0.5 rounded-full">
                    {productsData.total}
                  </span>
                )}
              </h2>
            </div>
            <Link href={`/products?brandId=${brand.id}`}>
              <button className="text-sm font-semibold text-[#F85606] hover:text-[#e04d00] flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                >
                  <Skeleton className="aspect-square w-full" />
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
                {(
                  productsData.items as React.ComponentProps<
                    typeof ProductCard
                  >[]
                ).map((product, i) => (
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
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                      className={`rounded-xl ${page === i + 1 ? "bg-[#F85606] text-white border-[#F85606]" : ""}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-xl"
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
      </div>

      {/* 4. BRAND STORY */}
      {visual && (
        <div className="bg-white py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
            >
              <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
                <img
                  src={visual.storyImage}
                  alt={`${brand.name} story`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-px bg-[#C9A84C]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                    Our Story
                  </span>
                </div>
                <h3 className="text-3xl font-black text-[#0F2D5E] font-display mb-4">
                  Trusted by Sri Lankan Families
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {visual.story}
                </p>
                <p className="text-gray-700 font-medium leading-relaxed text-sm mb-6">
                  {brand.name} is part of the Manju Group family — Sri Lanka's
                  trusted multi-brand company committed to delivering quality
                  products at affordable prices across all 25 districts.
                </p>
                <div className="flex items-center gap-3">
                  <Link href="/about">
                    <button className="border-2 border-[#0F2D5E] text-[#0F2D5E] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0F2D5E] hover:text-white transition-all flex items-center gap-2">
                      About Manju Group <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Contact CTA */}
      <div className="bg-[#0F2D5E] py-14">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display mb-3">
              Need help choosing the right{" "}
              <span style={{ color: "#C9A84C" }}>{brand.name}</span> product?
            </h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto text-sm">
              Our product experts are ready to help you find the perfect fit.
              Visit a showroom or get in touch today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button
                  className="h-12 px-8 rounded-full font-semibold text-[#0F2D5E] hover:scale-[1.02] transition-all"
                  style={{ background: "#C9A84C" }}
                >
                  <Phone size={16} className="mr-2" /> Contact Us
                </Button>
              </Link>
              <Link href="/locations">
                <Button
                  variant="outline"
                  className="h-12 px-8 rounded-full font-semibold border-white/30 text-white hover:bg-white/10 transition-all"
                >
                  <MapPin size={16} className="mr-2" /> Find a Showroom
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
