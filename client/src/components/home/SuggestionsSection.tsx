import { useState, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { STATIC_PRODUCTS } from "@/lib/staticData";
import { trpc } from "@/lib/trpc";

export default function SuggestionsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const { data: featuredData } = trpc.products.getFeatured.useQuery({ limit: 10 });

  const suggestions =
    featuredData && featuredData.length > 0
      ? featuredData.map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.salePrice ?? p.basePrice,
          image: p.imageUrl || "/scooter_red.webp",
        }))
      : STATIC_PRODUCTS.filter(p => p.id !== 3)
          .slice(0, 10)
          .map(p => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.salePrice ? Number(p.salePrice) : Number(p.basePrice),
            image: p.imageUrl,
          }));

  if (suggestions.length === 0) return null;

  return (
    <section className="w-full bg-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Title Area */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-[#0052B4] rounded-full"></div>
            <h2 className="text-[26px] font-black text-[#002D62] tracking-tight font-display">
              Recommended For You
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                prevBtnEnabled
                  ? "bg-white border border-[#0052B4]/30 text-[#0052B4] hover:bg-blue-50 cursor-pointer shadow-sm"
                  : "bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Previous suggestions"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                nextBtnEnabled
                  ? "bg-white border border-[#0052B4]/30 text-[#0052B4] hover:bg-blue-50 cursor-pointer shadow-sm"
                  : "bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Next suggestions"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Brand Royal Blue Container Area */}
        <div className="bg-gradient-to-r from-[#003875] via-[#0052B4] to-[#003366] rounded-xl p-4 md:p-6 flex flex-col md:flex-row shadow-lg">
          {/* Left Brand Badge Area */}
          <div className="w-full md:w-1/4 flex flex-col items-center justify-center min-h-[160px] mb-4 md:mb-0 text-white p-4 border-b md:border-b-0 md:border-r border-white/10">
            <div className="flex flex-col items-center justify-center text-center">
              <img
                src="/manju-logo.webp"
                alt="Manju Group"
                className="w-20 h-20 rounded-full bg-[#0052B4] ring-4 ring-white/80 shadow-md object-contain mb-3"
              />
              <span className="font-black text-sm uppercase tracking-wider text-white">
                TOP PICKS
              </span>
              <span className="text-xs text-blue-200 mt-1">
                Specially curated for your home &amp; business
              </span>
            </div>
          </div>

          {/* Right Carousel Area */}
          <div className="w-full md:w-3/4 md:pl-2">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex touch-pan-y -ml-4">
                {suggestions.map(product => (
                  <div
                    key={product.id}
                    className="flex-none pl-4 min-w-[70%] sm:min-w-[50%] md:min-w-[33.333%] lg:min-w-[25%]"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="block h-full bg-white rounded flex flex-col items-center justify-between p-3 cursor-pointer hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                    >
                      <div className="w-full h-[140px] flex items-center justify-center mb-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <div className="w-full flex flex-col items-center text-center mt-auto">
                        <h3 className="text-[#365176] text-xs font-semibold leading-snug mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-[#4C6789] font-bold text-sm">
                          RS. {product.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
