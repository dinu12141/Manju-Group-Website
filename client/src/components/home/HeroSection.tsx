import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAdSettings } from "@/lib/adSettings";
import { Sparkles, Zap, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const { config } = useAdSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");

  const { heroVideo, heroFlashSale, heroSlides } = config;

  // Offers Slider effect
  useEffect(() => {
    if (!heroSlides || heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [heroSlides?.length]);

  // Countdown timer effect for the sale item
  useEffect(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const updateTimer = () => {
      const now = new Date();
      const diff = endOfDay.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-white py-3 sm:py-4 border-b border-gray-200">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:h-[440px]">
          {/* Main Hero Video / Banner Ad Area */}
          <div className="w-full lg:w-3/4 min-h-[260px] sm:min-h-[320px] lg:h-full rounded-2xl bg-gray-950 relative overflow-hidden group shadow-md border border-slate-200 flex justify-center items-center">
            {heroVideo.videoUrl.endsWith(".mp4") || heroVideo.videoUrl.endsWith(".webm") ? (
              <video
                src={heroVideo.videoUrl}
                autoPlay={heroVideo.autoPlay}
                loop
                muted
                playsInline
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                onClick={e => {
                  const video = e.target as HTMLVideoElement;
                  if (video.paused) video.play();
                  else video.pause();
                }}
              />
            ) : (
              <img
                src={heroVideo.videoUrl}
                alt={heroVideo.title}
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none"></div>

            {/* Content Overlay */}
            <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8 text-white z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="max-w-xl">
                {heroVideo.badge && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0052B4]/80 border border-blue-400/40 text-blue-100 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5 sm:mb-2.5 backdrop-blur-md">
                    <Sparkles size={11} className="text-[#C9A84C]" />
                    <span>{heroVideo.badge}</span>
                  </div>
                )}
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-1 sm:mb-2 font-display drop-shadow-md tracking-tight leading-tight">
                  {heroVideo.title}
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-slate-200/90 font-medium leading-relaxed drop-shadow line-clamp-2">
                  {heroVideo.subtitle}
                </p>
              </div>

              {heroVideo.linkUrl && (
                <Link href={heroVideo.linkUrl} className="self-start sm:self-auto">
                  <button className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#F85606] to-[#d44700] hover:from-[#ff641a] hover:to-[#e04d00] text-white text-[11px] sm:text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0">
                    <span>Explore Products</span>
                    <ArrowRight size={13} />
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Right Side 2-Ad Banners */}
          <div className="w-full lg:w-1/4 flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-4">
            {/* Top Right: Flash Sale Ad Banner */}
            <Link
              href={heroFlashSale.linkUrl || "/products"}
              className="flex-1 min-h-[160px] sm:min-h-[190px] rounded-2xl bg-white overflow-hidden relative group cursor-pointer border border-red-200 shadow-sm hover:shadow-md transition-all duration-300 block"
            >
              <img
                src={heroFlashSale.imageUrl}
                alt={heroFlashSale.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 bg-slate-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                <Zap size={11} className="fill-white" />
                <span>{heroFlashSale.badge || "Flash Sale"}</span>
              </div>

              <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/20 shadow">
                {timeLeft}
              </div>

              {/* Title & Pricing */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <h3 className="font-bold text-xs sm:text-sm leading-tight mb-0.5 drop-shadow-md line-clamp-2">
                  {heroFlashSale.title}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-amber-400 font-extrabold text-sm sm:text-base drop-shadow-md">
                    Rs. {heroFlashSale.price}
                  </span>
                  {heroFlashSale.originalPrice && (
                    <span className="text-gray-300 text-[10px] line-through drop-shadow-md">
                      Rs. {heroFlashSale.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Bottom Right: Offers Slider Ad Banner */}
            {heroSlides && heroSlides.length > 0 && (
              <div className="flex-1 min-h-[160px] sm:min-h-[190px] rounded-2xl bg-white overflow-hidden relative border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                {heroSlides.map((slide, idx) => (
                  <Link
                    key={slide.id || idx}
                    href={slide.linkUrl || "/products"}
                    className={`absolute inset-0 transition-opacity duration-500 cursor-pointer block ${
                      idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover bg-slate-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

                    <div className="absolute top-2.5 left-2.5 bg-[#0052B4] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      {slide.badge || "Special Offer"}
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <span className="text-[9px] uppercase font-bold text-blue-200 block mb-0.5">
                        {slide.category}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm line-clamp-2 leading-tight mb-0.5">
                        {slide.title}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-black text-xs sm:text-sm">
                          {slide.price.startsWith("Rs.") ? slide.price : `Rs. ${slide.price}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Slider Dots */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 z-20 pb-1 pointer-events-none">
                  {heroSlides.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? "bg-[#0052B4] w-3" : "bg-white/50"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
