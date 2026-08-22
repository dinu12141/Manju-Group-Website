import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Bike, Tv, Snowflake, Droplets, Sparkles } from "lucide-react";

interface CategoryItem {
  title: string;
  brandName: string;
  badge: string;
  tagline: string;
  specs: string;
  image: string;
  brandId: number;
  categoryId: number;
  accentColor: string;
  accentBg: string;
  borderHover: string;
  icon: typeof Bike;
}

const CATEGORIES: CategoryItem[] = [
  {
    title: "Electric Bikes",
    brandName: "Dew Motors",
    badge: "Eco Mobility",
    tagline: "High-power electric mobility for everyday Sri Lankan commutes.",
    specs: "Up to 80 km Range • 2400W Motor",
    image: "/scooter_red.png",
    brandId: 1,
    categoryId: 1,
    accentColor: "#059669",
    accentBg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    borderHover: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
    icon: Bike,
  },
  {
    title: "Smart TVs",
    brandName: "Dew Plus",
    badge: "4K UHD Entertainment",
    tagline: "Vivid Android displays with built-in Google TV & streaming apps.",
    specs: '32" to 98" Screens • Dolby Audio',
    image: "/dew_plus_55_tv.png",
    brandId: 2,
    categoryId: 2,
    accentColor: "#2563EB",
    accentBg: "from-blue-500/10 via-blue-500/5 to-transparent",
    borderHover: "hover:border-blue-500/40 hover:shadow-blue-500/10",
    icon: Tv,
  },
  {
    title: "Air Conditioners",
    brandName: "DEW+ AC",
    badge: "Smart Inverter",
    tagline: "Energy-efficient cooling with eco-friendly R32 refrigerant.",
    specs: "1 to 2 Ton • Up to 40% Energy Saving",
    image: "/dew_plus_ac_2ton.png",
    brandId: 3,
    categoryId: 3,
    accentColor: "#0284C7",
    accentBg: "from-sky-500/10 via-sky-500/5 to-transparent",
    borderHover: "hover:border-sky-500/40 hover:shadow-sky-500/10",
    icon: Snowflake,
  },
  {
    title: "Water Purifiers",
    brandName: "Manju Dew Super",
    badge: "Pure Health",
    tagline: "Advanced multi-stage RO, UV & UF water purification systems.",
    specs: "7-Stage RO+UV • Hot & Cold Dispenser",
    image: "/ro_water_purifier.png",
    brandId: 4,
    categoryId: 4,
    accentColor: "#0D9488",
    accentBg: "from-teal-500/10 via-teal-500/5 to-transparent",
    borderHover: "hover:border-teal-500/40 hover:shadow-teal-500/10",
    icon: Droplets,
  },
];

export default function PopularCategories() {
  return (
    <section className="w-full bg-[#F8FAFC] py-16 px-4 md:px-8 border-b border-slate-200/80">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052B4]/10 text-[#0052B4] text-xs font-extrabold uppercase tracking-wider mb-2">
              <Sparkles size={13} />
              <span>Flagship Product Lines</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 font-display tracking-tight">
              Popular Categories
            </h2>
            <p className="text-slate-600 text-sm md:text-base font-medium mt-1 max-w-xl">
              Explore our four specialized brands engineered for modern Sri Lankan homes and mobility.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-extrabold text-[#0052B4] hover:text-[#003875] transition-colors group cursor-pointer"
          >
            <span>View Complete Catalog</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4-Card Luxury Responsive Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={`/products?categoryId=${cat.categoryId}`}
                className={`group relative flex flex-col justify-between bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer ${cat.borderHover}`}
              >
                {/* Background Subtle Gradient Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.accentBg} opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                {/* Top Info Bar */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: cat.accentColor }}
                    >
                      <Icon size={12} />
                      <span>{cat.brandName}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-slate-900 font-display group-hover:text-[#0052B4] transition-colors leading-tight mb-1">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed">
                    {cat.specs}
                  </p>
                </div>

                {/* Center / Bottom Product Image Visual Showcase */}
                <div className="relative z-10 w-full h-44 my-4 flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 group-hover:drop-shadow-xl transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="relative z-10 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black">
                  <span className="text-slate-700 font-bold group-hover:text-[#0052B4] transition-colors">
                    Explore Collection
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-[-45deg] transition-all duration-300"
                    style={{ backgroundColor: cat.accentColor }}
                  >
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
