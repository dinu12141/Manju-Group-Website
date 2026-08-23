import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAdSettings } from "@/lib/adSettings";
import { Sparkles, Zap, Volume2, VolumeX, Play, Pause } from "lucide-react";

export default function HeroSection() {
  const { config } = useAdSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { heroVideo, heroFlashSale, heroSlides } = config;

  // Video Audio & Autoplay Controller
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = heroVideo.volume ?? 1.0;

    const tryPlay = async () => {
      try {
        video.muted = isMuted;
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn(
          "Browser blocked unmuted autoplay, falling back to muted autoplay until user interaction:",
          err
        );
        // Autoplay policy fallback: mute and play
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      }
    };

    tryPlay();
  }, [heroVideo.videoUrl, isMuted, heroVideo.volume]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.muted || isMuted) {
      video.muted = false;
      video.volume = 1.0;
      setIsMuted(false);
      setHasUserInteracted(true);
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    // If currently muted on first click, unmute it immediately!
    if (isMuted || video.muted) {
      video.muted = false;
      video.volume = 1.0;
      setIsMuted(false);
      setHasUserInteracted(true);
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      }
    } else {
      togglePlay({ stopPropagation: () => {} } as any);
    }
  };

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

  const isVideo =
    heroVideo.videoUrl.endsWith(".mp4") ||
    heroVideo.videoUrl.endsWith(".webm") ||
    heroVideo.videoUrl.includes("/video");

  return (
    <section className="w-full bg-white py-3 sm:py-4 border-b border-gray-200">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:h-[480px]">
          {/* Main Hero Video / Banner Ad Area */}
          <div
            onClick={handleVideoClick}
            className="w-full lg:w-3/4 min-h-[380px] sm:min-h-[420px] lg:h-full rounded-2xl bg-gray-950 relative overflow-hidden group shadow-md border border-slate-200 flex justify-center items-center cursor-pointer"
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={heroVideo.videoUrl}
                autoPlay={heroVideo.autoPlay}
                muted
                loop
                playsInline
                preload="auto"
                // @ts-expect-error fetchPriority not yet in React's DOM typings but is a valid HTML attribute
                fetchPriority="high"
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-90 transition-transform duration-700 group-hover:scale-102"
              />
            ) : (
              <img
                src={heroVideo.videoUrl}
                alt={heroVideo.title}
                loading="eager"
                decoding="async"
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-90 transition-transform duration-700 group-hover:scale-102"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/25 pointer-events-none"></div>

            {/* Top Interactive Controls (Sound & Playback) */}
            {isVideo && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
                {/* Minimalist Sound Toggle Icon Button (No Text) */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`w-8 h-8 rounded-full backdrop-blur-md border text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
                    isMuted
                      ? "bg-red-600/80 hover:bg-red-600 border-red-400/60 text-white"
                      : "bg-black/60 hover:bg-black/80 border-white/30 text-white"
                  }`}
                  title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
                  title={isPlaying ? "Pause Video" : "Play Video"}
                >
                  {isPlaying ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} className="ml-0.5" />
                  )}
                </button>
              </div>
            )}

            {/* Content Overlay */}
            <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8 text-white z-10">
              <div className="max-w-xl">
                {heroVideo.badge && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0052B4]/90 border border-blue-400/50 text-blue-100 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5 sm:mb-2.5 backdrop-blur-md shadow-md">
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
            </div>
          </div>

          {/* Right Side 2-Ad Banners */}
          <div className="w-full lg:w-1/4 flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-4">
            {/* Top Right: Flash Sale Ad Banner */}
            <Link
              href={heroFlashSale.linkUrl || "/products"}
              className="flex-1 h-[210px] sm:h-[220px] lg:h-auto min-h-[200px] rounded-2xl sm:rounded-3xl bg-gray-900 overflow-hidden relative group cursor-pointer border border-red-500/30 shadow-md hover:shadow-xl transition-all duration-300 block"
            >
              <img
                src={heroFlashSale.imageUrl}
                alt={heroFlashSale.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"></div>

              {/* Badges */}
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 border border-white/20">
                <Zap size={12} className="fill-white" />
                <span>{heroFlashSale.badge || "Flash Sale"}</span>
              </div>

              <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md text-white text-[11px] font-mono font-black px-2.5 py-1 rounded-lg border border-white/25 shadow-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                <span>{timeLeft}</span>
              </div>

              {/* Title & Pricing */}
              <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                <h3 className="font-extrabold text-sm sm:text-base leading-snug mb-1 drop-shadow-md line-clamp-2">
                  {heroFlashSale.title}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-amber-400 font-black text-base sm:text-lg drop-shadow-md">
                    Rs. {heroFlashSale.price}
                  </span>
                  {heroFlashSale.originalPrice && (
                    <span className="text-slate-300 text-xs line-through drop-shadow-md font-semibold">
                      Rs. {heroFlashSale.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Bottom Right: Offers Slider Ad Banner */}
            {heroSlides && heroSlides.length > 0 && (
              <div className="flex-1 h-[210px] sm:h-[220px] lg:h-auto min-h-[200px] rounded-2xl sm:rounded-3xl bg-gray-900 overflow-hidden relative border border-blue-400/30 shadow-md hover:shadow-xl transition-all duration-300">
                {heroSlides.map((slide, idx) => (
                  <Link
                    key={slide.id || idx}
                    href={slide.linkUrl || "/products"}
                    className={`absolute inset-0 transition-opacity duration-500 cursor-pointer block ${
                      idx === currentSlide
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center bg-gray-900"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10"></div>

                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#0052B4] to-[#0070F3] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/20">
                      {slide.badge || "Special Offer"}
                    </div>

                    <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                      <span className="text-[10px] uppercase font-black tracking-wider text-blue-300 block mb-0.5">
                        {slide.category}
                      </span>
                      <h3 className="font-extrabold text-sm sm:text-base line-clamp-2 leading-snug mb-1 drop-shadow-md">
                        {slide.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-black text-base sm:text-lg drop-shadow-md">
                          {slide.price.startsWith("Rs.")
                            ? slide.price
                            : `Rs. ${slide.price}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Slider Dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20 pb-0.5 pointer-events-none">
                  {heroSlides.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide
                          ? "bg-[#38BDF8] w-5 shadow-xs"
                          : "bg-white/60 w-1.5"
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
