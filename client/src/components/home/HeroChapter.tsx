import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Truck, Zap, Snowflake, Sparkles } from "lucide-react";

const NAVY = "#0F2D5E";
const GOLD = "#C9A84C";
const ORANGE = "#F85606";

// Verified imagery — each URL fetched and visually confirmed to depict
// the correct subject before use (earlier IDs had silently mismatched
// content, e.g. an AC "unit" that was actually headphones).
const BIKE_IMAGE =
  "https://images.unsplash.com/photo-1780688999276-196babc7a7a8?auto=format&fit=crop&w=700&q=85";
const AC_IMAGE =
  "https://images.unsplash.com/photo-1718203862467-c33159fdc504?auto=format&fit=crop&w=1100&q=85";
const TV_IMAGES = {
  tv1: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=80",
  tv2: "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=400&q=80",
  tv3: "https://images.unsplash.com/photo-1601944177325-f8867652837f?auto=format&fit=crop&w=400&q=80",
};

function useCountdown(hours: number) {
  const [target] = useState(() => Date.now() + hours * 3600 * 1000);
  const [remaining, setRemaining] = useState(target - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return { h, m, s };
}

function CountdownBadge({ label = "Ends in" }: { label?: string }) {
  const { h, m, s } = useCountdown(9);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 shadow-lg">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
        {label}
      </span>
      <div className="flex items-center gap-1 font-mono font-bold text-[13px] text-white tabular-nums">
        {[h, m, s].map((v, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="px-1.5">{pad(v)}</span>
            {i < 2 && <span className="text-white/30">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

const SLIDE_COUNT = 3;

export default function HeroChapter() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % SLIDE_COUNT);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 7500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden bg-[#050B18]">
      <div className="relative w-full min-h-[400px] sm:min-h-[440px] lg:min-h-[480px]">
        <AnimatePresence mode="wait">
          {current === 0 && (
            <motion.div
              key="bikes"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {/* Layered ambient background */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 900px 600px at 15% 20%, rgba(8,145,178,0.35), transparent 60%), radial-gradient(ellipse 700px 500px at 85% 80%, rgba(22,163,74,0.22), transparent 60%), #071426",
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
              />

              <div className="relative z-10 h-full container flex items-center py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] items-center gap-10 w-full">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300/90 mb-4">
                      <Sparkles size={12} />
                      New Arrival
                    </span>
                    <h1
                      className="font-black leading-[0.98] text-white mb-5"
                      style={{ fontSize: "clamp(2rem, 4.6vw, 3.5rem)" }}
                    >
                      Ride the
                      <br />
                      <span
                        className="text-transparent bg-clip-text"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, #67E8F9, #4ADE80)",
                        }}
                      >
                        Electric Revolution
                      </span>
                    </h1>
                    <p className="text-white/55 text-sm sm:text-base leading-relaxed max-w-sm mb-6">
                      High-torque scooters engineered for Sri Lanka's roads —
                      zero fuel cost, all-day range.
                    </p>
                    <div className="mb-7">
                      <CountdownBadge label="Flash sale ends in" />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link href="/brands/dew-motors">
                        <motion.button
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-7 py-3 rounded-xl font-bold text-sm shadow-xl text-[#052e1a]"
                          style={{
                            background:
                              "linear-gradient(135deg, #67E8F9, #4ADE80)",
                          }}
                        >
                          Shop Electric Bikes
                        </motion.button>
                      </Link>
                      <div className="flex items-center gap-1.5 text-white/45 text-xs font-medium">
                        <Truck size={13} />
                        Free Delivery
                      </div>
                    </div>
                  </div>

                  {/* Glass product card */}
                  <div className="hidden lg:flex items-center justify-center">
                    <motion.div
                      initial={{ y: 10 }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 3.4,
                        ease: "easeInOut",
                      }}
                      className="relative w-full max-w-[340px] rounded-3xl p-3 border border-white/15"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
                      }}
                    >
                      <img
                        src={BIKE_IMAGE}
                        alt="Dew Motors electric bike"
                        className="w-full h-64 object-cover rounded-2xl"
                      />
                      <div className="flex items-center justify-between px-2 py-3">
                        <div>
                          <div className="text-white/50 text-[11px] font-medium">
                            Starting from
                          </div>
                          <div className="text-white font-black text-lg">
                            LKR 89,900
                          </div>
                        </div>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(74,222,128,0.18)" }}
                        >
                          <Zap size={18} className="text-emerald-300" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {current === 1 && (
            <motion.div
              key="tvs"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, #071a38 65%)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
              />
              <div
                className="absolute -top-24 right-0 w-[420px] h-[420px] rounded-full blur-[110px] opacity-25"
                style={{ background: GOLD }}
              />

              <div className="relative z-10 h-full container flex flex-col justify-center py-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-6">
                  <div>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] text-white mb-4"
                      style={{ background: ORANGE }}
                    >
                      Mega Deal
                    </span>
                    <h1 className="font-black leading-[0.98] mb-3">
                      <span
                        className="block text-transparent bg-clip-text"
                        style={{
                          fontSize: "clamp(2rem, 4.2vw, 3.25rem)",
                          backgroundImage: `linear-gradient(135deg, ${GOLD}, #fff)`,
                        }}
                      >
                        Up to 20% Off
                      </span>
                      <span className="block text-white/90 text-lg sm:text-xl font-bold">
                        4K Android Smart TVs
                      </span>
                    </h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <CountdownBadge label="Deal ends in" />
                    <Link href="/brands/dew-plus">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-6 py-3 rounded-xl bg-white font-bold text-sm shadow-lg whitespace-nowrap"
                        style={{ color: NAVY }}
                      >
                        Shop Now
                      </motion.button>
                    </Link>
                  </div>
                </div>

                {/* Glass product row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      name: '43" 4K Android',
                      img: TV_IMAGES.tv1,
                      was: "LKR 55,900",
                      price: "LKR 45,900",
                      off: "18%",
                    },
                    {
                      name: '55" QLED',
                      img: TV_IMAGES.tv2,
                      was: "LKR 98,000",
                      price: "LKR 78,900",
                      off: "20%",
                    },
                    {
                      name: '32" HD Ready',
                      img: TV_IMAGES.tv3,
                      was: "LKR 32,500",
                      price: "LKR 27,900",
                      off: "14%",
                    },
                  ].map(p => (
                    <Link key={p.name} href="/brands/dew-plus">
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="relative rounded-2xl p-3 border border-white/10 cursor-pointer overflow-hidden"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          backdropFilter: "blur(16px)",
                        }}
                      >
                        <span
                          className="absolute top-3 right-3 z-10 text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                          style={{ background: ORANGE }}
                        >
                          {p.off} OFF
                        </span>
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-full h-24 sm:h-28 object-cover rounded-xl mb-2.5"
                        />
                        <div className="text-white text-xs sm:text-[13px] font-bold leading-tight mb-1 truncate">
                          {p.name}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className="font-black text-sm sm:text-base"
                            style={{ color: GOLD }}
                          >
                            {p.price}
                          </span>
                          <span className="text-white/35 text-[10px] line-through">
                            {p.was}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {current === 2 && (
            <motion.div
              key="ac"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 900px 650px at 80% 30%, rgba(8,145,178,0.30), transparent 60%), #071a2e",
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
              />

              <div className="relative z-10 h-full container flex items-center py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-10 w-full">
                  <div>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] text-white mb-5"
                      style={{ background: "rgba(8,145,178,0.9)" }}
                    >
                      Season Sale
                    </span>
                    <div className="flex items-end gap-4 mb-4">
                      <div
                        className="font-black leading-none text-transparent bg-clip-text"
                        style={{
                          fontSize: "clamp(3.25rem, 7vw, 5.5rem)",
                          backgroundImage:
                            "linear-gradient(135deg, #7DD3FC, #38BDF8)",
                        }}
                      >
                        50%
                      </div>
                      <div className="text-white/85 font-bold text-lg sm:text-xl mb-2 leading-tight">
                        Less
                        <br />
                        Electricity
                      </div>
                    </div>
                    <p className="text-white/55 text-sm sm:text-base leading-relaxed mb-7 max-w-sm">
                      Inverter Air Conditioners engineered to cut your power
                      bill — cool faster, spend less, every month.
                    </p>
                    <div className="flex items-center gap-4 flex-wrap mb-7">
                      <CountdownBadge label="Offer ends in" />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link href="/brands/dew-plus-ac">
                        <motion.button
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-7 py-3 rounded-xl font-bold text-sm shadow-xl text-white"
                          style={{ background: "#0891B2" }}
                        >
                          Shop Air Conditioners
                        </motion.button>
                      </Link>
                      <div className="flex items-center gap-1.5 text-white/45 text-xs font-medium">
                        <ShieldCheck size={13} />
                        Genuine Warranty
                      </div>
                    </div>
                  </div>

                  {/* Spotlighted product shot */}
                  <div className="hidden lg:flex items-center justify-center">
                    <motion.div
                      initial={{ y: 10 }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 3.4,
                        ease: "easeInOut",
                      }}
                      className="relative w-full max-w-[360px]"
                    >
                      {/* Bright spotlight glow behind the product */}
                      <div
                        className="absolute inset-0 rounded-full blur-[70px] opacity-60"
                        style={{ background: "#0891B2" }}
                      />
                      <div
                        className="relative rounded-3xl p-3 border border-white/15"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          backdropFilter: "blur(20px)",
                          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
                        }}
                      >
                        <img
                          src={AC_IMAGE}
                          alt="DEW+ Inverter Air Conditioner unit"
                          className="w-full h-64 object-cover rounded-2xl"
                          style={{
                            filter:
                              "brightness(1.08) saturate(1.15) contrast(1.05)",
                          }}
                        />
                        <div className="flex items-center justify-between px-2 py-3">
                          <div>
                            <div className="text-white/50 text-[11px] font-medium">
                              Starting from
                            </div>
                            <div className="text-white font-black text-lg">
                              LKR 79,900
                            </div>
                          </div>
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(56,189,248,0.18)" }}
                          >
                            <Snowflake size={18} className="text-sky-300" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trust strip */}
      <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container flex items-center justify-center gap-6 py-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-medium">
            <ShieldCheck size={12} />
            Genuine Warranty
          </div>
          <div className="w-px h-3 bg-white/15" />
          <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-medium">
            <Truck size={12} />
            Island-wide Delivery
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-11 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 22 : 6,
              height: 6,
              background: i === current ? "white" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
