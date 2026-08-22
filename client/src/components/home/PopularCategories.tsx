import { Link } from "wouter";

const CATEGORIES = [
  {
    title: "Electric Bikes",
    subtitle: "Eco Green Mobility",
    bg: "bg-[#ecfdf5]", // light emerald
    image: "/scooter_red.png",
    brandId: 1,
    textColor: "text-emerald-600",
  },
  {
    title: "Smart TVs",
    subtitle: "Crystal Clear 4K",
    bg: "bg-[#eff6ff]", // light blue
    image: "/dew_plus_55_tv.png",
    brandId: 2,
    textColor: "text-blue-600",
  },
  {
    title: "Air Conditioners",
    subtitle: "Smart Inverter Comfort",
    bg: "bg-[#fef9c3]", // light amber/yellow
    image: "/dew_plus_ac_1_5ton.png",
    brandId: 3,
    textColor: "text-amber-600",
  },
  {
    title: "Water Purifiers",
    subtitle: "Pure Health Solutions",
    bg: "bg-[#e0f2fe]", // light cyan
    image: "/ro_water_purifier.png",
    brandId: 4,
    textColor: "text-cyan-600",
  },
];

export default function PopularCategories() {
  return (
    <section className="w-full bg-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-[5px] h-[32px] bg-[#0052B4] rounded-full"></div>
          <h2 className="text-[28px] font-black text-[#002D62] tracking-tight font-display">
            Popular Categories
          </h2>
        </div>

        {/* Grid: 4 Core Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?brandId=${cat.brandId}`}
              className={`block relative rounded-2xl overflow-hidden p-6 cursor-pointer border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-[210px] ${cat.bg} group w-full`}
            >
              <div className="relative z-10 flex flex-col h-full justify-between max-w-[55%]">
                <div>
                  <span
                    className={`text-[12px] sm:text-[13px] font-bold uppercase tracking-wider block mb-1.5 ${cat.textColor}`}
                  >
                    {cat.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display leading-tight">
                    {cat.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0052B4] group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <span>→</span>
                </div>
              </div>

              {/* Image positioned at bottom right */}
              <div className="absolute right-2 bottom-2 w-1/2 h-full flex items-end justify-end transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="max-h-[85%] max-w-full object-contain drop-shadow-lg"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
