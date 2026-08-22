import { Link } from "wouter";
import { ArrowRight, Zap, Sparkles } from "lucide-react";

export default function PromoBanners() {
  return (
    <section className="w-full bg-white py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1: Dew Motors Electric Bikes */}
          <Link
            href="/products?categoryId=1"
            className="relative rounded-2xl overflow-hidden group cursor-pointer h-[230px] sm:h-[270px] md:h-[290px] shadow-md hover:shadow-xl transition-all duration-500 border border-slate-200/60 block"
          >
            <img
              src="/banner_ebike_cinematic.jpg"
              alt="Dew Motors Electric Bikes Collection 2026"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex flex-col justify-center p-6 md:p-8">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Zap size={12} className="fill-slate-950" />
                  NEW ARRIVALS 2026
                </span>
              </div>
              <h3 className="text-white text-2xl sm:text-3xl font-extrabold mb-1.5 leading-tight tracking-tight drop-shadow-md font-display">
                Dew Motors
                <br />
                <span className="text-[#60A5FA]">Electric Bikes</span>
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mb-4 max-w-[280px] drop-shadow line-clamp-1">
                Eco-Friendly · 80km Range · 2400W Power
              </p>
              <div className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                <span className="underline underline-offset-4">
                  Explore Models
                </span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1.5 transition-transform duration-300"
                />
              </div>
            </div>
          </Link>

          {/* Banner 2: Dew Plus 4K Smart TVs */}
          <Link
            href="/products?categoryId=2"
            className="relative rounded-2xl overflow-hidden group cursor-pointer h-[230px] sm:h-[270px] md:h-[290px] shadow-md hover:shadow-xl transition-all duration-500 border border-slate-200/60 block"
          >
            <img
              src="/banner_smarttv_cinematic.jpg"
              alt="Dew Plus 4K Frameless Smart TVs"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00224d]/90 via-[#003875]/65 to-transparent flex flex-col justify-center p-6 md:p-8">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="bg-[#60A5FA] text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles size={12} className="fill-slate-950" />
                  LIMITED TIME OFFER
                </span>
              </div>
              <h3 className="text-white text-2xl sm:text-3xl font-extrabold mb-1.5 leading-tight tracking-tight drop-shadow-md font-display">
                Dew Plus 4K
                <br />
                <span className="text-[#60A5FA]">Frameless Smart TVs</span>
              </h3>
              <p className="text-blue-100/90 text-xs sm:text-sm font-medium mb-4 max-w-[280px] drop-shadow line-clamp-1">
                4K UHD · Android 12 · Immersive Audio
              </p>
              <div className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider group-hover:text-[#60A5FA] transition-colors">
                <span className="underline underline-offset-4">
                  Discover Deals
                </span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1.5 transition-transform duration-300"
                />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
