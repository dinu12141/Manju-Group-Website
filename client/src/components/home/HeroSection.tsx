import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAdSettings } from "@/lib/adSettings";
import { Sparkles, Zap, ArrowRight, Play, Pause } from "lucide-react";

export default function HeroSection() {
  const { config } = useAdSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

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
    <section className="w-full bg-white py-4 border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-4 h-[440px]">
          {/* Main Hero Video / Banner Ad Area */}
          <div className="w-full lg:w-3/4 h-full rounded-2xl bg-gray-950 relative overflow-hidden group shadow-md border border-slate-200 flex justify-center items-center">
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
                  if (video.paused) {
                    video.play();
                    setIsVideoPlaying(true);
                  } else {
                    video.pause();
                    setIsVideoPlaying(false);
                  }
                }}
              />
            ) : (
              <img
                src={heroVideo.videoUrl}
                alt={heroVideo.title}
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none"></div>

            {/* Content Overlay */}
            <div className="absolute bottom-8 left-8 right-8 text-white z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-xl">
                {heroVideo.badge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0052B4]/80 border border-blue-400/40 text-blue-100 text-xs font-black uppercase tracking-wider mb-2.5 backdrop-blur-md">
                    <Sparkles size={12} className="text-[#C9A84C]" />
                    <span>{heroVideo.badge}</span>
                  </div>
                )}
                <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 font-display drop-shadow-md tracking-tight leading-tight">
                  {heroVideo.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-200/90 font-medium leading-relaxed drop-shadow line-clamp-2">
                  {heroVideo.subtitle}
                </p>
              </div>

              {heroVideo.linkUrl && (
                <Link href={heroVideo.linkUrl}>
                  <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F85606] to-[#d44700] hover:from-[#ff641a] hover:to-[#e04d00] text-white text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0">
                    <span>Explore Products</span>
                    <ArrowRight size={14} />
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Right Side 2-Ad Banners */}
          <div className="w-full lg:w-1/4 h-full flex flex-col gap-4">
            {/* Top Right: Flash Sale Ad Banner */}
            <Link
              href={heroFlashSale.linkUrl || "/products"}
              className="flex-1 rounded-2xl bg-white overflow-hidden relative group cursor-pointer border border-red-200 shadow-sm hover:shadow-md transition-all duration-300 block"
            >
              <img
                src={heroFlashSale.imageUrl}
                alt={heroFlashSale.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 bg-slate-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                <Zap size={11} className="fill-white" />
                <span>{heroFlashSale.badge || "Flash Sale"}</span>
              </div>

              <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/20 shadow">
                {timeLeft}
              </div>

              {/* Title & Pricing */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-bold text-xs sm:text-sm leading-tight mb-1 drop-shadow-md line-clamp-2">
                  {heroFlashSale.title}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-amber-400 font-extrabold text-base drop-shadow-md">
                    Rs. {heroFlashSale.price}
                  </span>
                  {heroFlashSale.originalPrice && (
                    <span className="text-gray-300 text-xs line-through drop-shadow-md">
                      Rs. {heroFlashSale.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Bottom Right: Offers Slider Ad Banner */}
            {heroSlides && heroSlides.length > 0 && (
              <div className="flex-1 rounded-2xl bg-white overflow-hidden relative border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
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

                    <div className="absolute top-2.5 left-2.5 bg-[#0052B4] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {slide.badge || "Special Offer"}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] uppercase font-bold text-blue-200 block mb-0.5">
                        {slide.category}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm line-clamp-2 leading-tight mb-0.5">
                        {slide.title}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-black text-sm">
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
