import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MILESTONES = [
  {
    year: "2010",
    title: "The Genesis",
    desc: "Founded with a mission to bring high-quality stationery to every school child.",
  },
  {
    year: "2015",
    title: "Smart Home Revolution",
    desc: "Launched Dew Plus, introducing premium, affordable smart televisions.",
  },
  {
    year: "2019",
    title: "Pure Water Initiative",
    desc: "Introduced Manju Dew Super water purifiers with advanced filtration.",
  },
  {
    year: "2022",
    title: "Green Mobility",
    desc: "Unveiled Dew Motors, pioneering electric motorcycles in Sri Lanka.",
  },
  {
    year: "2025",
    title: "Eco Inverters & Beyond",
    desc: "Launched DEW+ AC split inverter units and smart device networks.",
  },
];

export default function TimelineChapter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollWidth = scrollWrapperRef.current?.scrollWidth || 0;
      const viewportWidth = window.innerWidth;

      gsap.to(scrollWrapperRef.current, {
        x: -(scrollWidth - viewportWidth + 100), // scroll to end
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${scrollWidth}`,
          pin: true,
          scrub: 1,
        },
      });

      // Animate line progress
      gsap.fromTo(
        ".timeline-progress",
        { width: "0%" },
        {
          width: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: `+=${scrollWidth}`,
            scrub: 1,
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="h-screen bg-[#050505] relative z-20 overflow-hidden flex items-center cinematic-wrapper"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,74,138,0.15)_0%,transparent_70%)] z-0" />

      <div className="container relative z-10 mx-auto w-full mb-20 pointer-events-none">
        <span className="text-[11px] font-bold text-sky-400 uppercase tracking-[0.3em]">
          Our Journey
        </span>
        <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-none uppercase mt-2">
          The Evolution of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-600">
            Manju Group
          </span>
        </h2>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[300px] flex items-center z-20">
        <div
          ref={scrollWrapperRef}
          className="flex flex-nowrap items-center px-10 md:px-32 gap-32"
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-px bg-white/10 z-0">
            <div className="timeline-progress h-full bg-sky-400 w-0 shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
          </div>

          {MILESTONES.map((m, idx) => (
            <div key={idx} className="relative z-10 w-[300px] shrink-0 group">
              <div className="w-16 h-16 rounded-full bg-[#050505] border-2 border-white/20 group-hover:border-sky-400 transition-colors duration-500 flex items-center justify-center mb-8 relative">
                <div className="w-4 h-4 bg-sky-400 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 shadow-[0_0_10px_rgba(56,189,248,1)]" />
              </div>
              <div className="text-5xl font-black text-white/10 group-hover:text-white/40 transition-colors duration-500 font-display absolute -top-16 -left-4 pointer-events-none">
                {m.year}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors">
                {m.title}
              </h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
