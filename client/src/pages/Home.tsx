import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shield,
  Truck,
  Headphones,
  Award,
  Zap,
  Tv,
  Snowflake,
  Droplets,
  BookOpen,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import ProductCard from "@/components/ProductCard";
import { MEGA_MENU_BRANDS } from "@/lib/data";

const HERO_SLIDES = [
  {
    id: 1,
    title: "Ride the Future",
    subtitle: "Dew Motors Electric Bikes",
    description:
      "Experience eco-friendly commuting with our powerful electric bikes. Up to 120km range per charge.",
    cta: "Shop Electric Bikes",
    href: "/brands/dew-motors",
    bg: "from-[#0F2D5E] to-[#1a4a8a]",
    accent: "#F59E0B",
    Icon: Zap,
    badge: "NEW 2025 MODELS",
  },
  {
    id: 2,
    title: "Crystal Clear Entertainment",
    subtitle: "Dew Plus Smart TVs",
    description:
      '4K Android Smart TVs with built-in streaming apps. Available in 32" to 65" sizes.',
    cta: "Explore Smart TVs",
    href: "/brands/dew-plus",
    bg: "from-[#1a1a2e] to-[#16213e]",
    accent: "#06B6D4",
    Icon: Tv,
    badge: "ANDROID TV",
  },
  {
    id: 3,
    title: "Cool Comfort, Guaranteed",
    subtitle: "DEW+ Air Conditioners",
    description:
      "Inverter split ACs with R32 eco-friendly gas. Free installation island-wide.",
    cta: "View AC Range",
    href: "/brands/dew-plus-ac",
    bg: "from-[#0F2D5E] to-[#0891b2]",
    accent: "#34D399",
    Icon: Snowflake,
    badge: "FREE INSTALLATION",
  },
  {
    id: 4,
    title: "Pure Water, Pure Life",
    subtitle: "Manju Dew Super Water Filters",
    description:
      "Advanced RO purification technology. Remove 99.9% of contaminants for safe drinking water.",
    cta: "Shop Water Filters",
    href: "/brands/manju-dew-super",
    bg: "from-[#065F46] to-[#047857]",
    accent: "#6EE7B7",
    Icon: Droplets,
    badge: "RO TECHNOLOGY",
  },
];

const TRUST_BADGES = [
  {
    icon: <Shield size={22} />,
    title: "Genuine Products",
    desc: "100% authentic, warranty-backed",
  },
  {
    icon: <Truck size={22} />,
    title: "Island-wide Delivery",
    desc: "Fast shipping across Sri Lanka",
  },
  {
    icon: <Headphones size={22} />,
    title: "24/7 Support",
    desc: "Always here to help you",
  },
  {
    icon: <Award size={22} />,
    title: "Quality Assured",
    desc: "ISO certified products",
  },
];

const BRAND_ICONS: Record<string, typeof Zap> = {
  "dew-motors": Zap,
  "dew-plus": Tv,
  "dew-plus-ac": Snowflake,
  "manju-dew-super": Droplets,
  "manju-exercise-books": BookOpen,
};

const CATEGORIES = [
  {
    label: "Electric Bikes",
    Icon: Zap,
    href: "/products?search=electric+bike",
    color: "bg-blue-50 hover:bg-blue-100",
    textColor: "text-navy",
    iconColor: "text-navy",
  },
  {
    label: "Smart TVs",
    Icon: Tv,
    href: "/products?search=smart+tv",
    color: "bg-indigo-50 hover:bg-indigo-100",
    textColor: "text-indigo-700",
    iconColor: "text-indigo-600",
  },
  {
    label: "Air Conditioners",
    Icon: Snowflake,
    href: "/products?search=inverter",
    color: "bg-cyan-50 hover:bg-cyan-100",
    textColor: "text-cyan-700",
    iconColor: "text-cyan-600",
  },
  {
    label: "Water Filters",
    Icon: Droplets,
    href: "/products?search=water+filter",
    color: "bg-emerald-50 hover:bg-emerald-100",
    textColor: "text-emerald-700",
    iconColor: "text-emerald-600",
  },
  {
    label: "Stationery",
    Icon: BookOpen,
    href: "/products?search=exercise+book",
    color: "bg-purple-50 hover:bg-purple-100",
    textColor: "text-purple-700",
    iconColor: "text-purple-600",
  },
];

const STATS = [
  { value: "15+", label: "Years of Excellence", Icon: Award },
  { value: "50,000+", label: "Happy Customers", Icon: Headphones },
  { value: "8+", label: "Showrooms Nationwide", Icon: Truck },
  { value: "5", label: "Premium Brands", Icon: Shield },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const { data: featuredProducts } = trpc.products.list.useQuery({
    isFeatured: true,
    limit: 8,
    page: 1,
    sortBy: "newest",
  });

  const { data: bestSellers } = trpc.products.list.useQuery({
    isBestSeller: true,
    limit: 4,
    page: 1,
    sortBy: "popular",
  });

  const { data: brands } = trpc.brands.list.useQuery();

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 8000);
  };

  const prevSlide = () =>
    goToSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const nextSlide = () => goToSlide((currentSlide + 1) % HERO_SLIDES.length);

  const slide = HERO_SLIDES[currentSlide];
  const SlideIcon = slide.Icon;

  return (
    <MainLayout>
      {/* Hero Carousel */}
      <section
        className="hero-slide relative h-[520px] sm:h-[560px] lg:h-[620px]"
        aria-roledescription="carousel"
        aria-label="Featured promotions"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bg} flex items-center`}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${currentSlide + 1} of ${HERO_SLIDES.length}: ${slide.title}`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />
            </div>

            <div className="container relative z-10">
              <div className="max-w-2xl">
                {slide.badge && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                    style={{
                      backgroundColor: slide.accent + "30",
                      color: slide.accent,
                      border: `1px solid ${slide.accent}50`,
                    }}
                  >
                    {slide.badge}
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white/70 text-sm font-medium mb-2"
                >
                  {slide.subtitle}
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-display mb-4 leading-tight"
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-white/80 text-base sm:text-lg mb-8 max-w-lg leading-relaxed"
                >
                  {slide.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-3"
                >
                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:gap-3"
                    style={{ backgroundColor: slide.accent, color: "#111" }}
                  >
                    {slide.cta} <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white border border-white/30 hover:bg-white/10 transition-colors"
                  >
                    All Products
                  </Link>
                </motion.div>
              </div>

              {/* Icon decoration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute right-8 top-1/2 -translate-y-1/2 select-none hidden md:block"
                aria-hidden="true"
              >
                <SlideIcon
                  className="w-[140px] h-[140px] lg:w-[220px] lg:h-[220px] text-white"
                  strokeWidth={1}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 active:bg-white/40 transition-colors z-20"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 active:bg-white/40 transition-colors z-20"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20"
          role="tablist"
          aria-label="Slide navigation"
        >
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goToSlide(i)}
              role="tab"
              aria-selected={i === currentSlide}
              aria-label={`Go to slide ${i + 1}: ${s.title}`}
              className={`rounded-full transition-all ${i === currentSlide ? "w-6 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-navy py-4">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_BADGES.map((badge, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <div className="text-amber flex-shrink-0">{badge.icon}</div>
                <div>
                  <div className="text-sm font-semibold">{badge.title}</div>
                  <div className="text-xs text-white/60 hidden sm:block">
                    {badge.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="py-14 sm:py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-10">
            <div className="section-label justify-center">Our Portfolio</div>
            <h2 className="section-title">Trusted Brands Under One Roof</h2>
            <p className="section-subtitle mx-auto">
              From electric mobility to home appliances — quality products for
              every Sri Lankan home
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {MEGA_MENU_BRANDS.map((brand, i) => {
              const BrandIcon = BRAND_ICONS[brand.slug] ?? Award;
              return (
                <Link key={brand.slug} href={`/brands/${brand.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="brand-card card-surface p-5 text-center cursor-pointer group h-full"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-navy/5 flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-colors">
                      <BrandIcon size={24} />
                    </div>
                    <div className="font-bold text-sm text-gray-800 group-hover:text-navy transition-colors">
                      {brand.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {brand.tagline}
                    </div>
                    <div className="mt-3 text-xs font-medium text-navy opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      Shop Now <ArrowRight size={12} />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-14 sm:py-16">
        <div className="container">
          <div className="text-center mb-10">
            <div className="section-label justify-center">Shop By Category</div>
            <h2 className="section-title">Find What You Need</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.label} href={cat.href}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -3 }}
                  className={`${cat.color} rounded-2xl p-5 text-center cursor-pointer transition-all border border-transparent hover:border-gray-200 hover:shadow-card h-full flex flex-col items-center justify-center`}
                >
                  <cat.Icon
                    className={`${cat.iconColor} mb-3`}
                    size={32}
                    strokeWidth={1.75}
                  />
                  <div className={`font-semibold text-sm ${cat.textColor}`}>
                    {cat.label}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.items.length > 0 && (
        <section className="py-14 sm:py-16">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <div className="section-label">Hand-picked</div>
                <h2 className="section-title mb-0">Featured Products</h2>
              </div>
              <Link
                href="/products?isFeatured=true"
                className="text-sm font-semibold text-navy flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {featuredProducts.items.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotional Banner */}
      <section className="py-14 sm:py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link href="/brands/dew-motors">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="brand-card relative h-48 bg-gradient-to-br from-[#0F2D5E] to-[#1a4a8a] p-6 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="text-amber text-xs font-bold uppercase tracking-wider mb-1">
                    Limited Offer
                  </div>
                  <h3 className="text-white text-xl font-bold font-display">
                    Electric Bikes
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    Starting from LKR 185,000
                  </p>
                </div>
                <div className="flex items-center gap-2 text-amber text-sm font-semibold">
                  Shop Now <ArrowRight size={14} />
                </div>
                <Zap
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 text-white/15"
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </motion.div>
            </Link>
            <Link href="/brands/dew-plus-ac">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="brand-card relative h-48 bg-gradient-to-br from-[#065F46] to-[#0891b2] p-6 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="text-green text-xs font-bold uppercase tracking-wider mb-1">
                    Free Installation
                  </div>
                  <h3 className="text-white text-xl font-bold font-display">
                    DEW+ Air Conditioners
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    Inverter technology, R32 eco-gas
                  </p>
                </div>
                <div className="flex items-center gap-2 text-green text-sm font-semibold">
                  Explore Range <ArrowRight size={14} />
                </div>
                <Snowflake
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 text-white/15"
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers && bestSellers.items.length > 0 && (
        <section className="py-14 sm:py-16">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <div className="section-label">Top Picks</div>
                <h2 className="section-title mb-0">Best Sellers</h2>
              </div>
              <Link
                href="/products?isBestSeller=true"
                className="text-sm font-semibold text-navy flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {bestSellers.items.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16 sm:py-20 bg-navy text-white">
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-label justify-center !text-amber">
              <span>Why Manju Group</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">
              Sri Lanka&apos;s Most Trusted Multi-Brand Company
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center flex flex-col items-center gap-3 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-amber/15 text-amber flex items-center justify-center">
                  <stat.Icon size={24} />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-amber font-display mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
