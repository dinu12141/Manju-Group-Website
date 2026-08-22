import { useRef, useState } from "react";
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
    overviewImage: "/scooter_red.png",
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
    productImage: "/scooter_silver.png",
    cta: "Explore Dew Motors",
    secondaryCta: "View Electric Bike Models",
  },
  "manju-dew-super": {
    slug: "manju-dew-super",
    category: "water",
    categoryLabel: "Pure Water",
    icon: Droplets,
    overviewImage: "/ro_water_purifier.png",
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
    productImage: "/dew_super_hot_cold_dispenser.png",
    cta: "Explore Water Solutions",
    secondaryCta: "View Purifier Models",
  },
  "dew-plus": {
    slug: "dew-plus",
    category: "entertainment",
    categoryLabel: "Entertainment",
    icon: Tv,
    overviewImage: "/dew_plus_55_tv.png",
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
    productImage: "/dew_plus_65_tv.png",
    cta: "Explore Smart TVs",
    secondaryCta: "Compare Screen Sizes",
  },
  "dew-plus-ac": {
    slug: "dew-plus-ac",
    category: "climate",
    categoryLabel: "Climate",
    icon: Snowflake,
    overviewImage: "/dew_plus_ac_1_5ton.png",
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
    productImage: "/dew_plus_ac_2ton.png",
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
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#0B2545] pt-16 pb-14 md:pt-20 md:pb-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 15% 0%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(201,168,76,0.14), transparent 60%)",
            }}
          />
          <div className="container relative max-w-6xl">
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4">
                Our Brand Portfolio
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-black leading-tight text-white mb-4">
                Four Brands. One Standard of Living Better.
              </h1>
              <p className="text-white/70 text-base leading-relaxed max-w-xl mb-8">
                From the way Sri Lanka moves to the way it lives, connects, and
                stays comfortable, Manju Group brings trusted solutions for
                modern everyday life.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => scrollToCategory("mobility")}
                  className="bg-[#F85606] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#e04d00] transition-colors shadow-lg"
                >
                  Explore Our Brands
                </button>
                <Link href="/about">
                  <button className="border border-white/25 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors">
                    Discover Manju Group
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Metrics row */}
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/10 pt-8"
            >
              {[
                { v: "4", l: "Specialist brands" },
                { v: "LK", l: "Sri Lankan market focus" },
                { v: "24/7", l: "Reliable customer support" },
                { v: "365", l: "Everyday solutions" },
              ].map(m => (
                <div key={m.l}>
                  <div className="text-2xl font-black text-white">{m.v}</div>
                  <div className="text-white/55 text-xs leading-snug mt-0.5">
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

        {/* PORTFOLIO OVERVIEW MOSAIC */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container max-w-6xl">
            <motion.h2
              {...reveal()}
              className="font-display text-2xl sm:text-3xl font-black text-[#0B2545] mb-10"
            >
              The Portfolio at a Glance
            </motion.h2>

            {isLoading && !orderedBrands.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {orderedBrands.map((brand, i) => {
                  const c = BRAND_CONTENT[brand!.slug];
                  const Icon = c.icon;
                  const isWide = i === 0;
                  return (
                    <motion.button
                      key={brand!.id}
                      onClick={() => scrollToCategory(c.category)}
                      {...reveal(i * 0.08)}
                      className={`group text-left rounded-[20px] border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow ${
                        isWide ? "md:col-span-2" : ""
                      }`}
                      style={{ backgroundColor: c.accentSoft }}
                    >
                      <div
                        className={`flex ${isWide ? "flex-col sm:flex-row" : "flex-col"} items-center`}
                      >
                        <div
                          className={`flex items-center justify-center p-6 ${isWide ? "sm:w-1/2" : "w-full"}`}
                        >
                          <img
                            src={c.overviewImage}
                            alt={brand!.name}
                            loading="lazy"
                            className="h-40 w-auto object-contain group-hover:scale-[1.03] transition-transform duration-500"
                          />
                        </div>
                        <div
                          className={`p-6 pt-0 sm:pt-6 ${isWide ? "sm:w-1/2" : "w-full"}`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Icon size={16} style={{ color: c.accent }} />
                            <span
                              className="text-xs font-bold uppercase tracking-widest"
                              style={{ color: c.accent }}
                            >
                              {c.categoryLabel}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-[#0B2545] mb-2">
                            {brand!.name}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            {c.overviewValueProp}
                          </p>
                          <span
                            className="inline-flex items-center gap-1.5 text-sm font-semibold"
                            style={{ color: c.accent }}
                          >
                            Explore Brand
                            <ArrowRight
                              size={14}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </span>
                        </div>
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
              ref={(el: HTMLDivElement | null) => {
                sectionRefs.current[c.category] = el;
              }}
              className={`${c.sectionBg} py-16 md:py-20 scroll-mt-32`}
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
