import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bike,
  Droplets,
  Tv,
  Snowflake,
  ShieldCheck,
  Sparkles,
  HeadphonesIcon,
  MapPinned,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { STATIC_BRANDS } from "@/lib/staticData";

type CategoryKey = "mobility" | "water" | "entertainment" | "climate";

interface BrandContent {
  slug: string;
  category: CategoryKey;
  categoryLabel: string;
  icon: typeof Bike;
  overviewImage: string;
  overviewTagline: string;
  overviewValueProp: string;
  accent: string;
  accentSoft: string;
  sectionBg: string;
  sectionHeading: string;
  sectionDescription: string;
  highlights: { label: string; value: string }[];
  productImage: string;
  cta: string;
  secondaryCta: string;
}

const BRAND_CONTENT: Record<string, BrandContent> = {
  "dew-motors": {
    slug: "dew-motors",
    category: "mobility",
    categoryLabel: "Mobility",
    icon: Bike,
    overviewImage: "/scooter_red.webp",
    overviewTagline: "Move Forward, Electrically.",
    overviewValueProp:
      "Smart electric mobility designed for practical, efficient, everyday travel.",
    accent: "#0F6B4F",
    accentSoft: "#E8F4EF",
    sectionBg: "bg-[#F3F8F6]",
    sectionHeading: "Power Your Ride. Go Electric.",
    sectionDescription:
      "Dew Motors is built for daily Sri Lankan commuting: efficient range, low running cost, and none of the fuel-station queues.",
    highlights: [
      { label: "Max Range", value: "80 km" },
      { label: "Top Speed", value: "70 km/h" },
      { label: "Warranty", value: "12 months" },
    ],
    productImage: "/scooter_silver.webp",
    cta: "Explore Dew Motors",
    secondaryCta: "View Electric Bike Models",
  },
  "manju-dew-super": {
    slug: "manju-dew-super",
    category: "water",
    categoryLabel: "Pure Water",
    icon: Droplets,
    overviewImage: "/ro_water_purifier.webp",
    overviewTagline: "Pure Water, Peace of Mind.",
    overviewValueProp:
      "Dependable water filtration designed for healthier modern homes and workplaces.",
    accent: "#0E7C86",
    accentSoft: "#E5F5F6",
    sectionBg: "bg-[#F1FAFA]",
    sectionHeading: "Better Water for Better Living.",
    sectionDescription:
      "Manju Dew Super combines RO, UV, and UF filtration stages so every household tap delivers clean, dependable water.",
    highlights: [
      { label: "Filtration", value: "7-Stage" },
      { label: "Maintenance", value: "Easy annual service" },
      { label: "Fit", value: "Home & office" },
    ],
    productImage: "/dew_super_hot_cold_dispenser.webp",
    cta: "Explore Water Solutions",
    secondaryCta: "View Purifier Models",
  },
  "dew-plus": {
    slug: "dew-plus",
    category: "entertainment",
    categoryLabel: "Entertainment",
    icon: Tv,
    overviewImage: "/dew_plus_55_tv.webp",
    overviewTagline: "Make Every Moment More Vivid.",
    overviewValueProp:
      "Smart entertainment with sharper pictures, richer sound, and easy access to your favourite content.",
    accent: "#3436A6",
    accentSoft: "#ECEBFA",
    sectionBg: "bg-[#F4F4FB]",
    sectionHeading: "Bring Every Story to Life.",
    sectionDescription:
      "Dew Plus Smart TVs pair vivid displays with Google TV, so streaming, live channels, and apps all live in one place.",
    highlights: [
      { label: "Screen Sizes", value: '32" to 98"' },
      { label: "Display", value: "4K UHD" },
      { label: "Warranty", value: "24 months" },
    ],
    productImage: "/dew_plus_65_tv.webp",
    cta: "Explore Smart TVs",
    secondaryCta: "Compare Screen Sizes",
  },
  "dew-plus-ac": {
    slug: "dew-plus-ac",
    category: "climate",
    categoryLabel: "Climate",
    icon: Snowflake,
    overviewImage: "/dew_plus_ac_1_5ton.webp",
    overviewTagline: "Comfort, Engineered for Every Day.",
    overviewValueProp:
      "Efficient climate solutions that keep Sri Lankan homes and businesses cool and comfortable.",
    accent: "#1D6FA5",
    accentSoft: "#E8F2FA",
    sectionBg: "bg-[#F2F7FB]",
    sectionHeading: "Comfort That Fits Your Space.",
    sectionDescription:
      "DEW+ inverter air conditioners use eco-friendly R32 refrigerant to cool faster while keeping electricity bills in check.",
    highlights: [
      { label: "Capacity", value: "1 to 2 Ton" },
      { label: "Energy Saving", value: "Up to 40%" },
      { label: "Compressor", value: "5-year warranty" },
    ],
    productImage: "/dew_plus_ac_2ton.webp",
    cta: "Explore Air Conditioners",
    secondaryCta: "Compare AC Capacities",
  },
};

const CATEGORY_TABS: { key: CategoryKey; label: string; icon: typeof Bike }[] =
  [
    { key: "mobility", label: "Mobility", icon: Bike },
    { key: "water", label: "Pure Water", icon: Droplets },
    { key: "entertainment", label: "Entertainment", icon: Tv },
    { key: "climate", label: "Climate", icon: Snowflake },
  ];

const TRUST_PILLARS = [
  {
    icon: Sparkles,
    title: "Curated Brands",
    desc: "Four specialist brands selected to cover the essentials of everyday life.",
  },
  {
    icon: ShieldCheck,
    title: "Practical Innovation",
    desc: "Technology chosen for reliability and everyday value, not novelty alone.",
  },
  {
    icon: HeadphonesIcon,
    title: "Customer Support",
    desc: "Real people ready to help you choose, install, and maintain your product.",
  },
  {
    icon: MapPinned,
    title: "Sri Lankan Relevance",
    desc: "Products and service built around how Sri Lankan homes actually live.",
  },
];

export default function Brands() {
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<CategoryKey>("mobility");
  const sectionRefs = useRef<
    Partial<Record<CategoryKey, HTMLDivElement | null>>
  >({});

  const { data: brandsData, isLoading } = trpc.brands.list.useQuery();
  const brands =
    brandsData && brandsData.length > 0 ? brandsData : STATIC_BRANDS;

  const orderedBrands = brands
    .filter(b => b && BRAND_CONTENT[b.slug])
    .sort(
      (a, b) =>
        CATEGORY_TABS.findIndex(
          t => t.key === BRAND_CONTENT[a!.slug].category
        ) -
        CATEGORY_TABS.findIndex(t => t.key === BRAND_CONTENT[b!.slug].category)
    );

  const scrollToCategory = (key: CategoryKey) => {
    setActiveTab(key);
    sectionRefs.current[key]?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const handleHashOrParam = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const catParam = (params.get("category") || hash).toLowerCase();

      const categoryMap: Record<string, CategoryKey> = {
        mobility: "mobility",
        "dew-motors": "mobility",
        water: "water",
        "manju-dew-super": "water",
        entertainment: "entertainment",
        "dew-plus": "entertainment",
        climate: "climate",
        "dew-plus-ac": "climate",
      };

      const targetCategory = categoryMap[catParam];
      if (targetCategory && sectionRefs.current[targetCategory]) {
        setTimeout(() => {
          scrollToCategory(targetCategory);
        }, 250);
      }
    };

    handleHashOrParam();
    window.addEventListener("hashchange", handleHashOrParam);
    return () => window.removeEventListener("hashchange", handleHashOrParam);
  }, [orderedBrands]);

  const reveal = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: {
            duration: 0.6,
            delay,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        };

  return (
    <MainLayout>
      <div className="bg-white text-[#111827]">
        {/* ── LUXURY ANIMATED HERO SECTION ─────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#00122e] via-[#001f4d] to-[#0b2854] pt-16 pb-16 md:pt-24 md:pb-20 text-white border-b border-blue-900/40">
          {/* Animated Ambient Glow Orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                x: [0, 60, 0],
                y: [0, -40, 0],
                scale: [1, 1.2, 1],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-transparent blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -50, 0],
                y: [0, 50, 0],
                scale: [1, 1.25, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute top-1/3 -right-20 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#0052B4]/30 via-cyan-500/20 to-transparent blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/15 via-blue-400/10 to-transparent blur-3xl"
            />

            {/* Subtle Tech Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
          </div>

          <div className="container relative z-10 max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading & Narrative (7 cols) */}
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-6 shadow-sm">
                  <Sparkles size={13} className="text-[#C9A84C]" />
                  <span>Our Brand Portfolio</span>
                </div>

                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-white mb-5 tracking-tight">
                  Four Brands. <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
                    One Standard
                  </span>{" "}
                  of Living Better.
                </h1>

                <p className="text-blue-100/85 text-base sm:text-lg leading-relaxed max-w-xl mb-8 font-medium">
                  From clean electric mobility to 4K home entertainment, smart inverter climate control, and pure drinking water—Manju Group brings trusted solutions for modern Sri Lankan everyday life.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => scrollToCategory("mobility")}
                    className="px-7 py-3.5 rounded-full text-sm font-extrabold text-white bg-gradient-to-r from-[#F85606] to-[#d44700] hover:from-[#ff641a] hover:to-[#e04d00] shadow-lg hover:shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Explore Brands</span>
                    <ArrowRight size={16} />
                  </button>

                  <Link href="/about">
                    <button className="px-7 py-3.5 rounded-full text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95">
                      Discover Our Story
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Right Column: 2x2 Floating Interactive Brand Cards (5 cols) */}
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-5"
              >
                <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Brand Card 1: Dew Motors */}
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => scrollToCategory("mobility")}
                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-emerald-400/50 shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Bike size={18} />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase text-emerald-400 tracking-wider block">
                      Mobility
                    </span>
                    <strong className="text-sm font-black text-white block mt-0.5 group-hover:text-emerald-300 transition-colors">
                      Dew Motors
                    </strong>
                    <span className="text-[11px] text-blue-100/70 font-medium block mt-1">
                      Electric Motorcycles & Scooters
                    </span>
                  </motion.div>

                  {/* Brand Card 2: Dew Plus */}
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => scrollToCategory("entertainment")}
                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-blue-400/50 shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Tv size={18} />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase text-blue-400 tracking-wider block">
                      Entertainment
                    </span>
                    <strong className="text-sm font-black text-white block mt-0.5 group-hover:text-blue-300 transition-colors">
                      Dew Plus
                    </strong>
                    <span className="text-[11px] text-blue-100/70 font-medium block mt-1">
                      4K UHD Smart Google TVs
                    </span>
                  </motion.div>

                  {/* Brand Card 3: DEW+ AC */}
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => scrollToCategory("climate")}
                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-sky-400/50 shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2.5 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                      <Snowflake size={18} />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase text-sky-400 tracking-wider block">
                      Climate Control
                    </span>
                    <strong className="text-sm font-black text-white block mt-0.5 group-hover:text-sky-300 transition-colors">
                      DEW+ AC
                    </strong>
                    <span className="text-[11px] text-blue-100/70 font-medium block mt-1">
                      Inverter Air Conditioners (R32)
                    </span>
                  </motion.div>

                  {/* Brand Card 4: Manju Dew Super */}
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => scrollToCategory("water")}
                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-teal-400/50 shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2.5 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                      <Droplets size={18} />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase text-teal-400 tracking-wider block">
                      Pure Water
                    </span>
                    <strong className="text-sm font-black text-white block mt-0.5 group-hover:text-teal-300 transition-colors">
                      Manju Dew Super
                    </strong>
                    <span className="text-[11px] text-blue-100/70 font-medium block mt-1">
                      7-Stage RO + UV Purifiers
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Glassmorphic Metrics Row */}
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 pt-8"
            >
              {[
                { v: "4 Flagships", l: "Specialist Brands" },
                { v: "100% Island-Wide", l: "Sri Lankan Coverage" },
                { v: "24/7 Support", l: "Dedicated Helpline" },
                { v: "365 Days", l: "Engineered Reliability" },
              ].map(m => (
                <div key={m.l} className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-black text-white">{m.v}</div>
                  <div className="text-blue-200/80 text-xs font-semibold mt-0.5">
                    {m.l}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CATEGORY TAB NAV */}
        <div className="sticky top-[66px] z-30 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="container max-w-6xl">
            <div className="flex gap-1 overflow-x-auto no-scrollbar py-3 -mx-1 px-1">
              {CATEGORY_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => scrollToCategory(tab.key)}
                    className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#0B2545] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── PORTFOLIO OVERVIEW SHOWCASE ─────────────────────────────── */}
        <section className="py-16 md:py-24 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="container max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052B4]/10 text-[#0052B4] text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Sparkles size={13} />
                  <span>Strategic Divisions</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 font-display tracking-tight">
                  The Portfolio at a Glance
                </h2>
                <p className="text-slate-600 text-sm md:text-base font-medium mt-1 max-w-xl">
                  Four specialized brand divisions engineered for performance, reliability, and everyday convenience.
                </p>
              </div>
            </div>

            {isLoading && !orderedBrands.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-3xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {orderedBrands.map((brand, i) => {
                  const c = BRAND_CONTENT[brand!.slug];
                  const Icon = c.icon;
                  return (
                    <motion.button
                      key={brand!.id}
                      onClick={() => scrollToCategory(c.category)}
                      {...reveal(i * 0.08)}
                      className="group text-left rounded-3xl bg-white border border-slate-200 p-6 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden cursor-pointer w-full"
                    >
                      {/* Top Ambient Glow */}
                      <div
                        className="absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none"
                        style={{ backgroundColor: c.accent }}
                      />

                      {/* Header Info */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-xs"
                            style={{ backgroundColor: c.accent }}
                          >
                            <Icon size={12} />
                            <span>{c.categoryLabel}</span>
                          </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-black text-slate-900 font-display mb-1.5 group-hover:text-[#0052B4] transition-colors">
                          {brand!.name}
                        </h3>

                        <p className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-2">
                          {c.overviewValueProp}
                        </p>
                      </div>

                      {/* Transparent Centered Product Visual Stage */}
                      <div className="relative z-10 w-full h-44 my-4 flex items-center justify-center">
                        <img
                          src={c.overviewImage}
                          alt={brand!.name}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 group-hover:drop-shadow-xl transition-all duration-500"
                        />
                      </div>

                      {/* Bottom Action */}
                      <div className="relative z-10 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black">
                        <span
                          className="inline-flex items-center gap-1.5 font-bold"
                          style={{ color: c.accent }}
                        >
                          Explore Brand
                          <ArrowRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FOUR DETAILED BRAND SECTIONS */}
        {orderedBrands.map((brand, i) => {
          const c = BRAND_CONTENT[brand!.slug];
          const Icon = c.icon;
          const imageFirst = i % 2 === 0;
          return (
            <section
              key={brand!.id}
              id={c.category}
              ref={(el: HTMLDivElement | null) => {
                sectionRefs.current[c.category] = el;
              }}
              className={`${c.sectionBg} py-16 md:py-20 scroll-mt-28`}
            >
              <div className="container max-w-6xl">
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                    imageFirst ? "" : "lg:[&>*:first-child]:order-2"
                  }`}
                >
                  <motion.div {...reveal()} className="flex justify-center">
                    <img
                      src={c.productImage}
                      alt={`${brand!.name} product`}
                      loading="lazy"
                      className="w-full max-w-md h-auto object-contain drop-shadow-xl"
                    />
                  </motion.div>
                  <motion.div {...reveal(0.1)}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={16} style={{ color: c.accent }} />
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: c.accent }}
                      >
                        {brand!.name}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0B2545] mb-4 leading-tight">
                      {c.sectionHeading}
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6 max-w-md">
                      {c.sectionDescription}
                    </p>
                    <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8">
                      {c.highlights.map(h => (
                        <div key={h.label}>
                          <div
                            className="text-lg font-black"
                            style={{ color: c.accent }}
                          >
                            {h.value}
                          </div>
                          <div className="text-gray-500 text-xs uppercase tracking-wide">
                            {h.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>
          );
        })}

        {/* WHY MANJU GROUP TRUST SECTION */}
        <section className="py-16 md:py-20 bg-white border-t border-gray-100">
          <div className="container max-w-6xl">
            <motion.h2
              {...reveal()}
              className="font-display text-2xl sm:text-3xl font-black text-[#0B2545] mb-10 text-center"
            >
              Why Manju Group
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_PILLARS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.title}
                    {...reveal(i * 0.08)}
                    className="text-center sm:text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#0B2545] flex items-center justify-center text-white mb-4 mx-auto sm:mx-0">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-[#0B2545] mb-1.5">
                      {p.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {p.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="bg-[#0B2545] py-16 text-center">
          <div className="container max-w-2xl">
            <motion.div {...reveal()}>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white mb-3">
                Find the Right Solution for Your Everyday.
              </h2>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                Explore our brands or speak with the Manju Group team to find
                the right product for your home, journey, or business.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                  <button className="bg-[#C9A84C] text-[#0B2545] px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
                    Talk to Our Team
                  </button>
                </Link>
                <Link href="/products">
                  <button className="border border-white/25 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
                    Browse All Products
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
