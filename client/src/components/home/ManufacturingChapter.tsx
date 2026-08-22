import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { Cpu, Settings, Activity } from "lucide-react";

const HIGHLIGHTS = [
  {
    title: "AI Smart Systems",
    desc: "Dynamically adjusting cooling and power based on real-time room occupancy and ambient temperature data.",
    icon: Activity,
    metric: "60% Energy Saved",
  },
  {
    title: "Dual-Core Lithium",
    desc: "Premium-grade EV cells featuring advanced liquid thermal management for optimal performance under load.",
    icon: Cpu,
    metric: "120km Range",
  },
  {
    title: "Precision Automation",
    desc: "Robotic assembly lines calibrated to micro-millimeter precision for uncompromised structural integrity.",
    icon: Settings,
    metric: "99.9% Defect-Free",
  },
];

export default function ManufacturingChapter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax image
      gsap.to(".mfg-img", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // Staggered reveal for cards
      gsap.from(".mfg-card", {
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-[#050505] relative z-20 overflow-hidden cinematic-wrapper"
    >
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-[0.3em] mb-4 block">
              Manufacturing Excellence
            </span>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tighter leading-[1.1] uppercase mb-8">
              Precision <br />
              <span className="text-gray-500">Engineering</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-md">
              Our state-of-the-art facilities combine robotic automation with
              human craftsmanship to deliver uncompromised quality across every
              product line.
            </p>

            <div className="space-y-6">
              {HIGHLIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="mfg-card p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex gap-5 items-start hover:bg-white/[0.05] transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                    <h.icon size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-white mb-2">
                      {h.title}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {h.desc}
                    </p>
                    <div className="inline-block px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest border border-sky-500/20">
                      {h.metric}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 relative h-[600px] lg:h-[800px] rounded-[2rem] overflow-hidden">
            <div className="absolute inset-0 bg-sky-400/20 blur-[120px] rounded-full z-0 transform translate-x-1/2" />
            <div className="relative z-10 w-full h-full rounded-[2rem] overflow-hidden border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
                alt="Manufacturing Facility"
                className="mfg-img w-full h-[120%] object-cover absolute top-[-10%] grayscale contrast-125 brightness-75 hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                <span className="text-xs font-bold tracking-widest uppercase text-white">
                  Live Facility Feed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
