import { useState, useEffect } from "react";
import { Link } from "wouter";
import { STATIC_PRODUCTS } from "@/lib/staticData";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [isOfferEnded, setIsOfferEnded] = useState(false);

  // Select products for the banners
  const saleProduct = STATIC_PRODUCTS.find(p => p.id === 1); // Dew EM005 Electric Bike
  const bestSellerProduct = STATIC_PRODUCTS.find(p => p.id === 2); // Next best seller
  const offerProducts = STATIC_PRODUCTS.filter(p => [4, 7, 10].includes(p.id)); // TV, AC, Water Purifier

  // Offers Slider effect
  useEffect(() => {
    if (offerProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % offerProducts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [offerProducts.length]);

  // Countdown timer effect for the sale item
  useEffect(() => {
    // Set to end of current day for demonstration
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const updateTimer = () => {
      const now = new Date();
      const diff = endOfDay.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setIsOfferEnded(true);
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
          {/* Main Slider Area */}
          <div className="w-full lg:w-3/4 h-full rounded bg-gray-900 relative overflow-hidden group cursor-pointer flex justify-center items-center">
            <video
              src="/promo-video.mp4"
              autoPlay
              loop
              playsInline
              className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-80"
              onClick={e => {
                const video = e.target as HTMLVideoElement;
                if (video.paused) video.play();
                else video.pause();
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-8 left-8 text-white pointer-events-none">
              <h2 className="text-4xl font-bold mb-2">
                Manju Group Manufacturing
              </h2>
              <p className="text-lg">
                Excellence in engineering and production. Delivering quality
                worldwide.
              </p>
            </div>
          </div>

          {/* Right Side Banners */}
          <div className="w-full lg:w-1/4 h-full flex flex-col gap-4">
            {/* Top Right: Time Sale / Best Seller Banner */}
            {(isOfferEnded ? bestSellerProduct : saleProduct) && (() => {
              const product = isOfferEnded ? bestSellerProduct! : saleProduct!;
              return (
              <Link
                href={`/products/${product.slug}`}
                className="flex-1 rounded bg-white overflow-hidden relative group cursor-pointer border border-red-200 shadow-sm hover:shadow-md transition-shadow block"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                <div className={`absolute top-2 left-2 ${isOfferEnded ? "bg-amber-400 text-slate-950" : "bg-red-600 text-white"} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow`}>
                  {isOfferEnded ? "Best Seller" : "Flash Sale"}
                </div>
                {!isOfferEnded && (
                  <div className="absolute top-2 right-2 bg-black/80 text-white text-[11px] font-mono font-bold px-2 py-1 rounded shadow">
                    {timeLeft}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 pr-3 text-white">
                  <h3 className="font-bold text-base leading-tight mb-1 drop-shadow-md">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-red-400 font-bold text-lg drop-shadow-md">
                      Rs. {Number(product.salePrice || product.basePrice).toLocaleString()}
                    </span>
                    {product.salePrice && (
                      <span className="text-gray-300 text-xs line-through drop-shadow-md">
                        Rs. {Number(product.basePrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              );
            })()}

            {/* Bottom Right: Offers Slider */}
            {offerProducts.length > 0 && (
              <div className="flex-1 rounded bg-white overflow-hidden relative border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                {offerProducts.map((prod, idx) => (
                  <Link
                    key={prod.id}
                    href={`/products/${prod.slug}`}
                    className={`absolute inset-0 transition-opacity duration-500 cursor-pointer block ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                    <div className="absolute top-2 left-2 bg-[#0052B4] text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider shadow">
                      Special Offers
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                        {prod.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-amber-400 font-bold">
                          Rs.{" "}
                          {Number(
                            prod.salePrice || prod.basePrice
                          ).toLocaleString()}
                        </span>
                        {prod.salePrice && (
                          <span className="text-gray-300 text-[11px] line-through">
                            Rs. {Number(prod.basePrice).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                {/* Dots indicator */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 z-20 pb-1 pointer-events-none">
                  {offerProducts.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentSlide ? "bg-[#0052B4]" : "bg-white/40"}`}
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
