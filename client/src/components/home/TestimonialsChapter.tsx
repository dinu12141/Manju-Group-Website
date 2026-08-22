import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Dr. Rehan Gunasekara",
    city: "Colombo",
    initials: "RG",
    product: "Dew Plus Smart TV",
    productColor: "bg-blue-50 text-blue-700 border-blue-100",
    avatarBg: "#2563EB",
    text: "The Dew Plus Smart TV picture quality is incredible. Colors are vibrant and the frameless design looks absolutely premium in my living room. Worth every rupee.",
    stars: 5,
  },
  {
    name: "Mrs. Medha Jayarathna",
    city: "Kandy",
    initials: "MJ",
    product: "Manju Dew Super",
    productColor: "bg-teal-50 text-teal-700 border-teal-100",
    avatarBg: "#0D9488",
    text: "We installed the Manju Dew Super RO Water Filter and the water quality improved dramatically. The hot/cold feature is truly excellent and the installation team was professional.",
    stars: 5,
  },
  {
    name: "Mr. Niroshan Ileperuma",
    city: "Galle",
    initials: "NI",
    product: "Dew Motors",
    productColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    avatarBg: "#16A34A",
    text: "My Dew Motors electric bike saves me so much money on fuel every month. The torque is impressive for Sri Lankan city roads and the battery lasts a full day easily.",
    stars: 5,
  },
  {
    name: "Dr. Thilini Mohan",
    city: "Negombo",
    initials: "TM",
    product: "DEW+ AC",
    productColor: "bg-cyan-50 text-cyan-700 border-cyan-100",
    avatarBg: "#0891B2",
    text: "DEW+ AC units are whisper quiet, cool the clinic fast, and keep electricity bills impressively low. We installed four units — all performing flawlessly after 2 years.",
    stars: 5,
  },
  {
    name: "Mr. Samantha Perera",
    city: "Matara",
    initials: "SP",
    product: 'Dew Plus 65" 4K TV',
    productColor: "bg-blue-50 text-blue-700 border-blue-100",
    avatarBg: "#2563EB",
    text: "The 65-inch Dew Plus Smart TV is unbelievable for movie nights with family. Sound output and 4K clarity match international brands at half the price.",
    stars: 5,
  },
  {
    name: "Mr. Kasun Wijesinghe",
    city: "Kurunegala",
    initials: "KW",
    product: "Dew Motors",
    productColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    avatarBg: "#16A34A",
    text: "Switched from petrol to a Dew Motors scooter 8 months ago. My monthly transport cost dropped from LKR 14,000 to under LKR 2,000. Incredible savings and great build quality.",
    stars: 5,
  },
];

const VISIBLE = 3;

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? "text-amber-400" : "text-gray-200"} fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsChapter() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number, direction: number) => {
    setDir(direction);
    setActive(idx);
  }, []);

  const next = useCallback(() => {
    goTo((active + 1) % TESTIMONIALS.length, 1);
  }, [active, goTo]);

  const prev = useCallback(() => {
    goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length, -1);
  }, [active, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 4500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, paused]);

  // Which 3 cards to show (wrap-around)
  const indices = Array.from(
    { length: VISIBLE },
    (_, i) => (active + i) % TESTIMONIALS.length
  );

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,45,94,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(15,45,94,.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#0F2D5E]/[0.03] rounded-full blur-3xl" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-[0.2em]">
                Success Stories
              </span>
            </div>
            <h2
              className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] text-gray-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What Our{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #0F2D5E, #C9A84C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Customers Say
              </span>
            </h2>
            <p className="text-gray-500 mt-3 text-base max-w-md">
              Real reviews from verified customers across Sri Lanka.
            </p>
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-[#0F2D5E] hover:text-[#0F2D5E] hover:bg-[#0F2D5E]/5 transition-all duration-200"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-[#0F2D5E] hover:text-[#0F2D5E] hover:bg-[#0F2D5E]/5 transition-all duration-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            {indices.map((tIdx, position) => {
              const t = TESTIMONIALS[tIdx];
              const isFeatured = position === 0;
              return (
                <motion.div
                  key={`${tIdx}-${active}`}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 60, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -dir * 40, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative rounded-2xl p-7 flex flex-col gap-5 border transition-shadow duration-300 hover:shadow-lg ${
                    isFeatured
                      ? "bg-[#0F2D5E] border-[#0F2D5E] shadow-xl shadow-[#0F2D5E]/20"
                      : "bg-white border-gray-100 shadow-sm"
                  }`}
                >
                  {/* Quote icon */}
                  <Quote
                    size={28}
                    className={isFeatured ? "text-white/20" : "text-gray-100"}
                    style={{ transform: "rotate(180deg)" }}
                  />

                  {/* Product badge */}
                  <span
                    className={`self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      isFeatured
                        ? "bg-white/10 text-white/70 border-white/20"
                        : t.productColor
                    }`}
                  >
                    {t.product}
                  </span>

                  {/* Review text */}
                  <p
                    className={`text-sm leading-relaxed flex-1 ${
                      isFeatured ? "text-white/80" : "text-gray-600"
                    }`}
                  >
                    "{t.text}"
                  </p>

                  {/* Stars + verified */}
                  <div className="flex items-center gap-2">
                    <StarRow count={t.stars} />
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold ml-auto ${
                        isFeatured ? "text-emerald-300" : "text-emerald-600"
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      Verified
                    </div>
                  </div>

                  {/* Author */}
                  <div
                    className={`flex items-center gap-3 pt-4 border-t ${
                      isFeatured ? "border-white/10" : "border-gray-100"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{
                        background: isFeatured
                          ? "rgba(255,255,255,0.2)"
                          : t.avatarBg,
                      }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div
                        className={`font-bold text-sm ${isFeatured ? "text-white" : "text-gray-900"}`}
                      >
                        {t.name}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${isFeatured ? "text-white/45" : "text-gray-400"}`}
                      >
                        from {t.city}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > active ? 1 : -1)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 h-2 bg-[#0F2D5E]"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
