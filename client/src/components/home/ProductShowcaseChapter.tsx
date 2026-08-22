import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Link } from "wouter";
import {
  Zap,
  Tv,
  Snowflake,
  BookOpen,
  Droplets,
  ArrowRight,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "dew-motors", label: "Electric Bikes" },
  { id: "dew-plus", label: "Smart TVs" },
  { id: "dew-plus-ac", label: "Air Conditioners" },
  { id: "manju-dew-super", label: "Water Filters" },
  { id: "manju-exercise-books", label: "Books" },
];

// Verified imagery — each URL fetched and visually confirmed to depict
// the correct subject before use (earlier IDs had silently mismatched
// content, e.g. an "AC unit" that was actually headphones, and a
// "notebook" that was actually a broken/dead link).
const PRODUCTS = [
  {
    id: "dew-plus",
    category: "dew-plus",
    name: 'Dew Plus 55" 4K Smart TV',
    subtitle: "Cinematic Home Entertainment",
    desc: "Frameless 4K HDR10 Android TV with stunning picture quality and smart streaming built-in.",
    icon: Tv,
    image: "/dew_plus_55_tv.png",
    brand: "Dew Plus",
    brandColor: "bg-blue-100 text-blue-700",
    glow: "#2563EB",
  },
  {
    id: "dew-motors",
    category: "dew-motors",
    name: "Dew Motors E-Scooter Pro",
    subtitle: "Electric Urban Mobility",
    desc: "High-torque electric scooter engineered for Sri Lankan roads with long-range battery life.",
    icon: Zap,
    image:
      "https://images.unsplash.com/photo-1780688999276-196babc7a7a8?auto=format&fit=crop&w=600&q=80",
    brand: "Dew Motors",
    brandColor: "bg-emerald-100 text-emerald-700",
    glow: "#16A34A",
  },
  {
    id: "dew-plus-ac",
    category: "dew-plus-ac",
    name: "DEW+ Inverter AC 12000 BTU",
    subtitle: "Energy-Efficient Cooling",
    desc: "Whisper-quiet inverter AC that cools fast and cuts electricity bills by up to 40%.",
    icon: Snowflake,
    image: "/dew_plus_ac_1ton.png",
    brand: "DEW+ AC",
    brandColor: "bg-cyan-100 text-cyan-700",
    glow: "#0891B2",
  },
  {
    id: "manju-dew-super",
    category: "manju-dew-super",
    name: "Manju Dew Super RO Filter",
    subtitle: "Advanced Water Purification",
    desc: "Multi-stage RO system delivering clean, pure, healthy drinking water for every family.",
    icon: Droplets,
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80",
    brand: "Manju Dew Super",
    brandColor: "bg-teal-100 text-teal-700",
    glow: "#0D9488",
  },
  {
    id: "manju-exercise-books",
    category: "manju-exercise-books",
    name: "Manju Exercise Book Set",
    subtitle: "Premium Student Stationery",
    desc: "High-quality ruled exercise books with smooth paper finish — trusted by students island-wide.",
    icon: BookOpen,
    image:
      "https://images.unsplash.com/photo-1531346644014-cde582069e71?auto=format&fit=crop&w=600&q=80",
    brand: "Manju Books",
    brandColor: "bg-violet-100 text-violet-700",
    glow: "#7C3AED",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

type Product = (typeof PRODUCTS)[number];

function TiltCard({ product }: { product: Product }) {
  const Icon = product.icon;
  const ref = useRef<HTMLDivElement>(null);

  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 300, damping: 25 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 300, damping: 25 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowOpacity = useTransform(rotateY, [-8, 0, 8], [0.5, 0, 0.5]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateYRaw.set((px - 0.5) * 14);
    rotateXRaw.set((0.5 - py) * 14);
    glowX.set(px * 100);
    glowY.set(py * 100);
  };

  const handleMouseLeave = () => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  };

  return (
    <motion.div variants={cardVariants} style={{ perspective: 1000 }}>
      <Link href={`/brands/${product.id}`}>
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          whileHover={{ scale: 1.02 }}
          transition={{ scale: { duration: 0.25 } }}
          className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 cursor-pointer h-full flex flex-col"
        >
          {/* Dynamic light glow following cursor */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
            style={{
              opacity: glowOpacity,
              background: useTransform(
                [glowX, glowY],
                ([x, y]) =>
                  `radial-gradient(320px circle at ${x}% ${y}%, ${product.glow}30, transparent 70%)`
              ),
            }}
          />

          {/* Image */}
          <div
            className="aspect-[4/3] bg-gray-100 rounded-t-2xl overflow-hidden relative"
            style={{ transform: "translateZ(20px)" }}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
            <span
              className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm ${product.brandColor}`}
            >
              {product.brand}
            </span>
          </div>

          {/* Content */}
          <div
            className="p-5 flex flex-col flex-1 relative z-10"
            style={{ transform: "translateZ(30px)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shadow-sm"
              style={{ background: `${product.glow}15` }}
            >
              <Icon size={18} style={{ color: product.glow }} />
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">
              {product.subtitle}
            </p>
            <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">
              {product.desc}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F2D5E] group-hover:gap-3 transition-all duration-200 mt-auto">
              View Product <ArrowRight size={12} />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function ProductShowcaseChapter() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <section id="discover" className="py-24 bg-white relative z-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-8 h-px bg-[#F85606]" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F85606]">
              Our Products
            </p>
            <span className="w-8 h-px bg-[#F85606]" />
          </div>
          <h2
            className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shop by{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #0F2D5E, #F85606)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Category
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From sustainable mobility to home comfort — explore our curated
            range of premium products.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-[#F85606] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
          >
            {filtered.map(product => (
              <TiltCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#F85606] text-white font-semibold text-sm hover:bg-[#e04d00] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View All Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
