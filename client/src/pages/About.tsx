import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bike,
  Droplets,
  Tv,
  Snowflake,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  MapPinned,
  Phone,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";

type CategoryKey = "mobility" | "water" | "entertainment" | "climate";

const PORTFOLIO_SNAPSHOT: {
  key: CategoryKey;
  icon: typeof Bike;
  title: string;
  desc: string;
  slug: string;
  accent: string;
}[] = [
  {
    key: "mobility",
    icon: Bike,
    title: "Move Better",
    desc: "Electric mobility for practical everyday journeys.",
    slug: "dew-motors",
    accent: "#0F6B4F",
  },
  {
    key: "water",
    icon: Droplets,
    title: "Live Pure",
    desc: "Water solutions for confident everyday living.",
    slug: "manju-dew-super",
    accent: "#0E7C86",
  },
  {
    key: "entertainment",
    icon: Tv,
    title: "Connect More",
    desc: "Smart entertainment for the moments that matter.",
    slug: "dew-plus",
    accent: "#3436A6",
  },
  {
    key: "climate",
    icon: Snowflake,
    title: "Feel Comfortable",
    desc: "Climate solutions for better spaces.",
    slug: "dew-plus-ac",
    accent: "#1D6FA5",
  },
];

const VALUE_MARKERS = [
  "Useful innovation",
  "Responsible value",
  "Dependable support",
  "Long-term relationships",
];

const TIMELINE = [
  {
    year: "2008",
    title: "The beginning",
    desc: "Manju Group was established in Colombo with a focus on bringing dependable products closer to Sri Lankan customers.",
  },
  {
    year: "2015",
    title: "Expanding into water solutions",
    desc: "The group introduced its water-filter category to support healthier, more confident everyday living.",
  },
  {
    year: "2018",
    title: "Smarter home entertainment",
    desc: "The group expanded into Smart TVs and connected home entertainment.",
  },
  {
    year: "2020",
    title: "Comfort for modern spaces",
    desc: "Air-conditioning solutions were added to the portfolio.",
  },
  {
    year: "2022",
    title: "Moving toward electric mobility",
    desc: "Dew Motors electric bikes were introduced as part of the group's future-focused mobility direction.",
  },
  {
    year: "2024",
    title: "Growing the customer experience",
    desc: "The group continued expanding its showroom and service presence across Sri Lanka.",
  },
];

const TRUST_PILLARS = [
  {
    icon: Sparkles,
    title: "Curated brands",
    desc: "A focused portfolio selected around real household, mobility, entertainment, and comfort needs.",
    link: { label: "View our brands", href: "/brands" },
  },
  {
    icon: ClipboardList,
    title: "Clear product guidance",
    desc: "Help customers understand the right product for their space, lifestyle, and budget.",
    link: { label: "Browse products", href: "/products" },
  },
  {
    icon: ShieldCheck,
    title: "Genuine support",
    desc: "Present warranty, service, and contact information clearly and honestly.",
    link: { label: "Contact support", href: "/contact" },
  },
  {
    icon: MapPinned,
    title: "Island-wide reach",
    desc: "Delivery, showroom, and service coverage communicated according to verified operational information.",
    link: { label: "Find a showroom", href: "/locations" },
  },
];

export default function About() {
  const prefersReducedMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: {
            duration: 0.6,
            delay,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        };

  return (
    <MainLayout>
      <div className="bg-white text-[#111827]">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#0B2545] pt-16 pb-14 md:pt-20 md:pb-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 15% 0%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(201,168,76,0.14), transparent 60%)",
            }}
          />
          <div className="container relative max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={
                  prefersReducedMotion ? undefined : { opacity: 0, y: 16 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4">
                  About Manju Group
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-black leading-tight text-white mb-4">
                  Making Everyday Living Better, One Trusted Brand at a Time.
                </h1>
                <p className="text-white/70 text-base leading-relaxed max-w-xl mb-8">
                  Manju Group brings together practical technology, thoughtful
                  products, and dependable service for the way Sri Lanka lives
                  today.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/brands">
                    <button className="bg-[#F85606] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#e04d00] transition-colors shadow-lg">
                      Explore Our Brands
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button className="border border-white/25 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors">
                      Talk to Our Team
                    </button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={
                  prefersReducedMotion ? undefined : { opacity: 0, y: 16 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="hidden lg:flex items-center justify-center gap-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <img
                    src="/scooter_silver.png"
                    alt="Dew Motors electric bike"
                    loading="lazy"
                    className="h-32 w-full object-contain bg-white/5 rounded-2xl p-4"
                  />
                  <img
                    src="/dew_plus_55_tv.png"
                    alt="Dew Plus Smart TV"
                    loading="lazy"
                    className="h-32 w-full object-contain bg-white/5 rounded-2xl p-4"
                  />
                  <img
                    src="/ro_water_purifier.png"
                    alt="Manju Dew Super water purifier"
                    loading="lazy"
                    className="h-32 w-full object-contain bg-white/5 rounded-2xl p-4"
                  />
                  <img
                    src="/dew_plus_ac_1_5ton.png"
                    alt="DEW+ air conditioner"
                    loading="lazy"
                    className="h-32 w-full object-contain bg-white/5 rounded-2xl p-4"
                  />
                </div>
              </motion.div>
            </div>

            {/* Metrics row */}
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/10 pt-8"
            >
              {[
                { v: "4", l: "Specialist categories" },
                { v: "LK", l: "Island-wide support" },
                { v: "Quality", l: "Quality-led products" },
                { v: "24/7", l: "Customer-first service" },
              ].map(m => (
                <div key={m.l}>
                  <div className="text-2xl font-black text-white">{m.v}</div>
                  <div className="text-white/55 text-xs leading-snug mt-0.5">
                    {m.l}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* MORE THAN PRODUCTS — PURPOSE STORY */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div {...reveal()} className="flex justify-center">
                <img
                  src="/dew_super_hot_cold_dispenser.png"
                  alt="Manju Dew Super hot and cold dispenser"
                  loading="lazy"
                  className="w-full max-w-md h-auto object-contain drop-shadow-xl"
                />
              </motion.div>
              <motion.div {...reveal(0.1)}>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">
                  Our Purpose
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0B2545] mb-4 leading-tight">
                  We bring useful innovation closer to everyday life.
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8 max-w-md">
                  From the way people move to the way they stay connected,
                  refreshed, and comfortable, Manju Group focuses on products
                  that make daily life simpler and more enjoyable. We carefully
                  build a portfolio of brands that respond to real needs,
                  supported by clear guidance, genuine warranties, and service
                  people can depend on.
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {VALUE_MARKERS.map(v => (
                    <div key={v} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B2545] flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-700">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PORTFOLIO SNAPSHOT */}
        <section className="py-16 md:py-20 bg-[#F8F9FB]">
          <div className="container max-w-6xl">
            <motion.h2
              {...reveal()}
              className="font-display text-2xl sm:text-3xl font-black text-[#0B2545] mb-10 text-center"
            >
              Four categories. One consistent promise.
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PORTFOLIO_SNAPSHOT.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link key={item.key} href={`/brands#${item.key}`}>
                    <motion.div
                      {...reveal(i * 0.08)}
                      className="group bg-white border border-gray-100 rounded-[20px] p-6 h-full hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4"
                        style={{ backgroundColor: item.accent }}
                      >
                        <Icon size={20} />
                      </div>
                      <h3 className="font-bold text-[#0B2545] mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">
                        {item.desc}
                      </p>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: item.accent }}
                      >
                        Discover category
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* COMPANY TIMELINE */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container max-w-4xl">
            <motion.div {...reveal()} className="text-center mb-14">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0B2545] mb-3">
                Growing with the needs of modern Sri Lanka.
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
                Our story has developed one practical step at a time, through
                new categories, stronger customer relationships, and a continued
                focus on products that belong in real everyday life.
              </p>
            </motion.div>

            <div className="relative">
              <div className="absolute left-3 sm:left-1/2 top-2 bottom-2 w-0.5 bg-gray-100 sm:-translate-x-1/2" />
              <div className="space-y-10">
                {TIMELINE.map((m, i) => {
                  const isEven = i % 2 === 0;
                  return (
                    <motion.div
                      key={m.year}
                      {...reveal(i * 0.06)}
                      className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 pl-10 sm:pl-0 ${
                        isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                      }`}
                    >
                      <div className="absolute left-0 sm:left-1/2 top-1 w-6 h-6 rounded-full bg-[#0B2545] border-4 border-white shadow-sm sm:-translate-x-1/2" />
                      <div
                        className={`sm:w-[calc(50%-2rem)] ${isEven ? "sm:text-right" : "sm:text-left"}`}
                      >
                        <span className="text-sm font-bold uppercase tracking-wider text-[#C9A84C]">
                          {m.year}
                        </span>
                        <h3 className="font-bold text-[#0B2545] mt-1 mb-1">
                          {m.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                      <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-10">
              Milestone years and details are pending final confirmation and
              will be updated as verified.
            </p>
          </div>
        </section>

        {/* TRUST PILLARS */}
        <section className="py-16 md:py-20 bg-[#F8F9FB]">
          <div className="container max-w-6xl">
            <motion.div {...reveal()} className="text-center mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0B2545] mb-3">
                Trust is built in the details.
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
                Choosing a product is only the beginning. We aim to make the
                experience clear before purchase, reliable after purchase, and
                straightforward whenever customers need support.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_PILLARS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.title}
                    {...reveal(i * 0.08)}
                    className="group bg-white border border-gray-100 rounded-[20px] p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#0B2545] flex items-center justify-center text-white mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-[#0B2545] mb-1.5">
                      {p.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      {p.desc}
                    </p>
                    <Link href={p.link.href}>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.link.label}
                        <ArrowRight size={14} />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CUSTOMER EXPERIENCE */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div {...reveal()}>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">
                  The Manju Group Experience
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0B2545] mb-4 leading-tight">
                  The product matters. The support around it matters just as
                  much.
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8 max-w-md">
                  We believe a strong customer experience is built through
                  honest guidance, dependable follow-through, and support that
                  remains accessible after the purchase. Every interaction is an
                  opportunity to make the next step easier.
                </p>
                <Link href="/contact">
                  <button className="bg-[#0B2545] text-white px-6 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                    Get in Touch <ArrowRight size={14} />
                  </button>
                </Link>
              </motion.div>
              <motion.div {...reveal(0.1)} className="flex justify-center">
                <img
                  src="/dew_super_ro_plus.png"
                  alt="Manju Dew Super RO purifier installation"
                  loading="lazy"
                  className="w-full max-w-md h-auto object-contain drop-shadow-xl"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* FUTURE DIRECTION */}
        <section className="relative overflow-hidden bg-[#0B2545] py-16 md:py-20 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 85% 100%, rgba(56,189,248,0.16), transparent 60%)",
            }}
          />
          <div className="container relative max-w-2xl">
            <motion.div {...reveal()}>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4">
                Looking Ahead
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
                Building a more connected, comfortable, and responsible future.
              </h2>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                As everyday life changes, Manju Group will continue to explore
                practical technologies and trusted product categories that help
                people live, move, and connect with greater confidence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/brands">
                  <button className="bg-[#C9A84C] text-[#0B2545] px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
                    Explore Our Brands
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="border border-white/25 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
                    Speak with Manju Group
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CLOSING CONTACT CTA */}
        <section className="py-16 bg-white border-t border-gray-100 text-center">
          <div className="container max-w-2xl">
            <motion.div {...reveal()}>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0B2545] mb-3">
                Want to know more about Manju Group?
              </h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Explore our brand portfolio or speak with our team about the
                right solution for your home, business, or everyday journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                  <button className="bg-[#F85606] text-white px-8 py-3 rounded-full font-bold hover:bg-[#e04d00] transition-colors shadow-lg inline-flex items-center gap-2">
                    <Phone size={16} /> Contact Us
                  </button>
                </Link>
                <Link href="/brands">
                  <button className="border border-gray-200 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-[#0B2545] hover:text-[#0B2545] transition-colors">
                    View Brands
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
