import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 15, suffix: "+", label: "Years of Excellence" },
  { value: 500, suffix: "+", label: "Brand Partners" },
  { value: 50000, suffix: "+", label: "Happy Customers", display: "50,000+" },
  { value: 10, suffix: "", label: "Store Locations" },
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      STATS.forEach((stat, i) => {
        const el = numRefs.current[i];
        if (!el) return;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: stat.value,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
          onUpdate() {
            const n = Math.round(counter.val);
            if (stat.display) {
              el.textContent =
                n >= stat.value
                  ? stat.display
                  : n.toLocaleString() + stat.suffix;
            } else {
              el.textContent = n + stat.suffix;
            }
          },
          onComplete() {
            el.textContent = stat.display ?? stat.value + stat.suffix;
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      className="relative py-24 overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* Subtle green radial at center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, oklch(65% 0.2 145 / 0.05) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-10 px-6 relative"
            >
              {/* Vertical divider — hidden on mobile, last item has none */}
              {i < STATS.length - 1 && (
                <div
                  className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
              )}
              <span
                ref={el => {
                  numRefs.current[i] = el;
                }}
                className="text-5xl md:text-7xl font-black text-white tabular-nums"
              >
                {stat.display ?? stat.value + stat.suffix}
              </span>
              <span className="mt-2 text-xs text-white/40 tracking-widest uppercase text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
