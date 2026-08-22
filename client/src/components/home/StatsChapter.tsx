import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Award, Calendar } from "lucide-react";

const STATS = [
  {
    icon: Users,
    value: 500,
    suffix: "K+",
    label: "Happy Customers",
    sub: "Across Sri Lanka",
    color: "#F85606",
  },
  {
    icon: MapPin,
    value: 25,
    suffix: "",
    label: "Districts Covered",
    sub: "Island-wide delivery",
    color: "#C9A84C",
  },
  {
    icon: Award,
    value: 5,
    suffix: "",
    label: "Trusted Brands",
    sub: "One group, one promise",
    color: "#C9A84C",
  },
  {
    icon: Calendar,
    value: 25,
    suffix: "+",
    label: "Years in Business",
    sub: "Since 1999",
    color: "#F85606",
  },
];

function CountUp({
  target,
  suffix,
  trigger,
}: {
  target: number;
  suffix: string;
  trigger: boolean;
}) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    const duration = 1800;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, target]);

  return (
    <span>
      {trigger ? count : 0}
      {suffix}
    </span>
  );
}

export default function StatsChapter() {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{ background: "#0F2D5E" }}
      className="relative overflow-hidden"
    >
      {/* Top orange accent */}
      <div className="h-1 w-full bg-[#F85606]" />

      {/* Subtle gold radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="container relative z-10 py-7">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
          {STATS.map(({ icon: Icon, value, suffix, label, sub, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: "easeOut" }}
              className="flex flex-col items-center text-center px-3 py-3 group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `${color}20`,
                  border: `1px solid ${color}40`,
                }}
              >
                <Icon size={15} style={{ color }} />
              </div>

              <div
                className="text-2xl sm:text-3xl font-black leading-none mb-1 tabular-nums"
                style={{ color }}
              >
                <CountUp target={value} suffix={suffix} trigger={triggered} />
              </div>

              <div className="text-white font-bold text-xs sm:text-sm leading-tight">
                {label}
              </div>
              <div className="text-white/35 text-[11px] mt-0.5">{sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
