import { Link } from "wouter";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import { useAdSettings } from "@/lib/adSettings";

const GRADIENT_THEMES: Record<string, string> = {
  ebike: "from-black/90 via-black/55 to-transparent",
  smarttv: "from-[#00224d]/95 via-[#003875]/70 to-transparent",
  water: "from-[#003344]/95 via-[#005577]/70 to-transparent",
  ac: "from-[#0a2540]/95 via-[#18497a]/70 to-transparent",
  gold: "from-[#2b1e06]/95 via-[#5c400c]/70 to-transparent",
};

export default function PromoBanners() {
  const { config } = useAdSettings();
  const { promoBanners } = config;

  if (!promoBanners || promoBanners.length === 0) return null;

  return (
    <section className="w-full bg-white py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className={`grid grid-cols-1 ${promoBanners.length > 1 ? "md:grid-cols-2" : ""} gap-6`}>
          {promoBanners.map(banner => {
            const gradientClass =
              GRADIENT_THEMES[banner.gradientTheme] || GRADIENT_THEMES.ebike;

            return (
              <Link
                key={banner.id}
                href={banner.linkUrl || "/products"}
                className="relative rounded-2xl overflow-hidden group cursor-pointer h-[230px] sm:h-[270px] md:h-[290px] shadow-md hover:shadow-xl transition-all duration-500 border border-slate-200/60 block bg-slate-900"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dynamic Gradient Overlays */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${gradientClass} flex flex-col justify-center p-6 md:p-8`}
                >
                  {banner.badge && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Zap size={12} className="fill-slate-950" />
                        {banner.badge}
                      </span>
                    </div>
                  )}

                  <h3 className="text-white text-2xl sm:text-3xl font-extrabold mb-1.5 leading-tight tracking-tight drop-shadow-md font-display">
                    {banner.title}
                  </h3>

                  {banner.subtitle && (
                    <p className="text-slate-200 text-xs sm:text-sm font-medium mb-4 max-w-[320px] drop-shadow line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}

                  <div className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                    <span className="underline underline-offset-4">
                      {banner.buttonText || "Explore Deals"}
                    </span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1.5 transition-transform duration-300"
                    />
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
