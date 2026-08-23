import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Tv,
  Zap,
  Snowflake,
  Droplets,
  BookOpen,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const BRANDS = [
  {
    slug: "dew-motors",
    name: "Dew Motors",
    tagline: "Electric Bikes & Scooters",
    desc: "High-torque electric mobility engineered for Sri Lanka's roads.",
    icon: Zap,
    accent: "#16A34A",
    accentLight: "#dcfce7",
    tag: "Mobility",
    image: "/scooter_silver.webp",
    stat: { value: "630,000", label: "From LKR" },
  },
  {
    slug: "dew-plus",
    name: "Dew Plus",
    tagline: "4K Smart TVs",
    desc: "Cinematic Android TVs with frameless HDR display technology.",
    icon: Tv,
    accent: "#2563EB",
    accentLight: "#dbeafe",
    tag: "Electronics",
    image: "/dew_plus_55_tv.webp",
    stat: { value: "74,400", label: "From LKR" },
  },
  {
    slug: "dew-plus-ac",
    name: "DEW+ AC",
    tagline: "Inverter Air Conditioners",
    desc: "Fast cooling, energy-saving AC for Sri Lankan homes & offices.",
    icon: Snowflake,
    accent: "#0891B2",
    accentLight: "#cffafe",
    tag: "Cooling",
    image: "/dew_plus_ac_1ton.webp",
    stat: { value: "145,000", label: "From LKR" },
  },
  {
    slug: "manju-dew-super",
    name: "Manju Dew Super",
    tagline: "Water Filtration Systems",
    desc: "Advanced RO systems & commercial plants for pure drinking water.",
    icon: Droplets,
    accent: "#0D9488",
    accentLight: "#ccfbf1",
    tag: "Health",
    image: "/ro_water_purifier.webp",
    stat: { value: "69,900", label: "From LKR" },
  },
];

export default function BrandsShowcaseChapter() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0F2D5E 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-[0.2em]">
                Our Portfolio
              </span>
            </div>
            <h2
              className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Four Brands,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #0F2D5E, #C9A84C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                One Promise
              </span>
            </h2>
            <p className="text-gray-500 mt-3 text-base max-w-lg">
              Engineering sustainable mobility, smart entertainment, climate
              comfort, and clean water across Sri Lanka.
            </p>
          </div>
          <Link href="/brands">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-2 text-sm font-semibold text-[#0F2D5E] hover:text-[#F85606] transition-colors cursor-pointer whitespace-nowrap"
            >
              View All Brands <ChevronRight size={16} />
            </motion.div>
          </Link>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BRANDS.map(
            (
              {
                slug,
                name,
                tagline,
                desc,
                icon: Icon,
                accent,
                accentLight,
                tag,
                image,
                stat,
              },
              i
            ) => (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
                className={i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}
              >
                <Link href={`/brands/${slug}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(to top, ${accent}cc 0%, transparent 55%)`,
                        }}
                      />
                      {/* Tag */}
                      <span
                        className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 shadow-sm"
                        style={{ color: accent }}
                      >
                        {tag}
                      </span>
                      {/* Price pill */}
                      <div className="absolute bottom-3 right-3 bg-white/95 rounded-xl px-3 py-1.5 shadow-sm">
                        <div className="text-[9px] text-gray-400 font-medium leading-none mb-0.5">
                          {stat.label}
                        </div>
                        <div
                          className="font-black text-sm leading-none"
                          style={{ color: accent }}
                        >
                          {stat.value}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: accentLight, color: accent }}
                        >
                          <Icon size={19} />
                        </div>
                        <motion.div
                          className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1"
                          style={{ color: accent }}
                        >
                          Explore <ArrowRight size={12} />
                        </motion.div>
                      </div>

                      <div>
                        <div className="font-bold text-gray-900 text-base leading-tight">
                          {name}
                        </div>
                        <div className="text-xs font-semibold text-gray-400 mt-0.5">
                          {tagline}
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 leading-relaxed flex-1">
                        {desc}
                      </p>

                      {/* Bottom CTA */}
                      <div
                        className="flex items-center gap-1.5 text-sm font-semibold mt-1 group-hover:gap-2.5 transition-all duration-200"
                        style={{ color: accent }}
                      >
                        Shop {name} <ArrowRight size={13} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
