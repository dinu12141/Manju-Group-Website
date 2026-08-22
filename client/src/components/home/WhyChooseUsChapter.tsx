import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  HeadphonesIcon,
  Award,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    title: "Island-wide Delivery",
    desc: "Fast & reliable delivery to all 25 Sri Lanka districts.",
    icon: Truck,
    metric: "25 Districts",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    hoverBorder: "hover:border-emerald-200",
  },
  {
    title: "Genuine Warranty",
    desc: "100% manufacturer-backed warranties on all products.",
    icon: ShieldCheck,
    metric: "Guaranteed",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    hoverBorder: "hover:border-blue-200",
  },
  {
    title: "4 Trusted Brands",
    desc: "One group, one promise across all product categories.",
    icon: Award,
    metric: "Premium Quality",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    hoverBorder: "hover:border-orange-200",
  },
  {
    title: "7-Day Support",
    desc: "Dedicated customer support every day of the week.",
    icon: HeadphonesIcon,
    metric: "Always Available",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    hoverBorder: "hover:border-violet-200",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

export default function WhyChooseUsChapter() {
  return (
    <section
      id="why-choose-us"
      className="py-24 bg-white relative z-20 overflow-hidden"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT: Text + image */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-gold" />
                <span className="text-xs font-bold text-gold uppercase tracking-[0.2em]">
                  The Manju Standard
                </span>
              </div>
              <h2
                className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] mb-5 text-gray-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Why{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #0F2D5E, #C9A84C)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Choose Us
                </span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                Sri Lanka's trusted multi-brand company delivering unparalleled
                quality across electric bikes, smart TVs, air conditioners, and
                water purification systems.
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4">
              {["ISO Certified", "25+ Years", "500K+ Customers"].map(badge => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-600"
                >
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  {badge}
                </div>
              ))}
            </div>

            {/* Image with floating trust card */}
            <div className="relative h-[300px] rounded-3xl overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/60">
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=900&q=80"
                alt="Why Choose Manju Group"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2D5E]/20 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <svg
                        key={s}
                        className="w-3.5 h-3.5 text-amber-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    4.9 / 5.0
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Trust Score
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: 4 stacked feature cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-7 flex flex-col gap-5"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className={`p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md ${f.hoverBorder} transition-all duration-300 flex items-start gap-4`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${f.iconBg} ${f.iconColor} flex items-center justify-center shrink-0`}
                >
                  <f.icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-base">
                      {f.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F2D5E] bg-[#0F2D5E]/5 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {f.metric}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
