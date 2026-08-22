import { motion } from "framer-motion";
import {
  Shield,
  Award,
  Users,
  Globe,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import StatsChapter from "@/components/home/StatsChapter";
import { MEGA_MENU_BRANDS } from "@/lib/data";
import { Link } from "wouter";

const VALUES = [
  {
    icon: <Shield size={22} />,
    title: "Quality Assurance",
    desc: "Every product meets rigorous quality standards before reaching our customers.",
  },
  {
    icon: <Award size={22} />,
    title: "Innovation",
    desc: "Continuously bringing the latest technology and innovations to Sri Lanka.",
  },
  {
    icon: <Users size={22} />,
    title: "Customer First",
    desc: "Our customers are at the heart of everything we do.",
  },
  {
    icon: <Globe size={22} />,
    title: "Sustainability",
    desc: "Committed to eco-friendly products and sustainable business practices.",
  },
];

const MILESTONES = [
  { year: "2008", event: "Manju Group founded in Colombo" },
  { year: "2015", event: "Launched Manju Dew Super water filters" },
  { year: "2018", event: "Introduced Dew Plus 4K Smart TVs" },
  { year: "2020", event: "Launched DEW+ Inverter Air Conditioners" },
  { year: "2022", event: "Dew Motors electric bikes introduced" },
  { year: "2024", event: "Opened 8th showroom island-wide" },
];

export default function About() {
  return (
    <MainLayout>
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-24 overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7/12 */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="w-6 h-px bg-gold" />
                <span className="text-gold text-xs font-bold uppercase tracking-widest">
                  Our Story
                </span>
              </div>
              <h1
                className="text-5xl font-black font-display mb-5 leading-tight"
                style={{ color: "#0F2D5E" }}
              >
                About Manju Group
              </h1>
              <p className="text-gray-700 font-medium max-w-lg text-base leading-relaxed mb-8">
                For over 15 years, Manju Group has been a trusted name in Sri
                Lankan homes, delivering quality products across five distinct
                categories — from electric mobility to home comfort, smart
                entertainment to clean water.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products">
                  <button className="px-7 py-3 bg-[#0F2D5E] text-white rounded-xl font-semibold hover:bg-[#1a4a8a] transition-colors inline-flex items-center gap-2">
                    Our Products <ArrowRight size={16} />
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="px-7 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-[#0F2D5E] hover:text-[#0F2D5E] transition-colors">
                    Get in Touch
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Right 5/12 */}
            <motion.div
              className="lg:col-span-5 hidden lg:block"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-xl h-[360px]">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                  alt="Manju Group office"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Story + Timeline */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-6 h-px bg-gold" />
                <span className="text-gold text-xs font-bold uppercase tracking-widest">
                  Our Journey
                </span>
              </div>
              <h2 className="text-3xl font-bold font-display text-gray-900 mb-5 leading-snug">
                Sri Lanka's Most Trusted Multi-Brand Group
              </h2>
              <p className="text-gray-700 font-medium leading-relaxed mb-4">
                Manju Group is one of Sri Lanka's leading multi-brand companies,
                operating across electric mobility, consumer electronics, home
                comfort, and water purification.
              </p>
              <p className="text-gray-700 font-medium leading-relaxed mb-6">
                We are committed to delivering quality products at affordable
                prices, backed by genuine warranties and island-wide service —
                making premium living accessible to every Sri Lankan family.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Island-wide delivery across all 25 districts",
                  "4 premier brands under one trusted group",
                  "50,000+ happy customers nationwide",
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2
                      size={16}
                      className="text-[#0F2D5E] flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Vertical Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative pl-8">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100" />
                {MILESTONES.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="relative mb-7 last:mb-0"
                  >
                    <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-[#0F2D5E] border-2 border-white shadow-sm" />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "#C9A84C" }}
                    >
                      {m.year}
                    </span>
                    <div className="text-sm font-semibold text-gray-800 mt-0.5">
                      {m.event}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900 rounded-2xl p-8 text-white"
            >
              <div
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "#C9A84C" }}
              >
                Our Mission
              </div>
              <h2 className="text-2xl font-bold font-display mb-4">
                Empowering Sri Lankan Homes
              </h2>
              <p className="text-white/60 leading-relaxed">
                To provide Sri Lankan families with access to premium,
                innovative, and affordable products that enhance their quality
                of life — while delivering exceptional customer service at every
                touchpoint.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm"
            >
              <div className="text-gold text-xs font-bold uppercase tracking-widest mb-3">
                Our Vision
              </div>
              <h2
                className="text-2xl font-bold font-display mb-4"
                style={{ color: "#0F2D5E" }}
              >
                Sri Lanka's #1 Multi-Brand Company
              </h2>
              <p className="text-gray-700 font-medium leading-relaxed">
                To become the most trusted and innovative multi-brand consumer
                goods company in Sri Lanka, setting the benchmark for product
                quality, customer satisfaction, and sustainable business
                practices.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-gold" />
              <span className="text-gold text-xs font-bold uppercase tracking-widest">
                What Drives Us
              </span>
              <span className="w-6 h-px bg-gold" />
            </div>
            <h2 className="text-3xl font-bold font-display text-gray-900">
              Our Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0F2D5E]/10 text-[#0F2D5E] flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Brands */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-gold" />
              <span className="text-gold text-xs font-bold uppercase tracking-widest">
                Our Portfolio
              </span>
              <span className="w-6 h-px bg-gold" />
            </div>
            <h2 className="text-3xl font-bold font-display text-gray-900">
              Five Brands, One Promise
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEGA_MENU_BRANDS.map((brand, i) => (
              <Link key={brand.slug} href={`/brands/${brand.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-[#0F2D5E] hover:shadow-md transition-all group cursor-pointer"
                >
                  <span className="text-3xl">{brand.icon}</span>
                  <div>
                    <div className="font-bold text-gray-800 group-hover:text-[#0F2D5E] transition-colors">
                      {brand.name}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">{brand.tagline}</div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="ml-auto text-gray-500 font-medium group-hover:text-[#0F2D5E] transition-colors"
                  />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <StatsChapter />

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold font-display text-gray-900 mb-5">
              Ready to Experience the Difference?
            </h2>
            <p className="text-gray-700 font-medium max-w-lg mx-auto mb-8 leading-relaxed">
              From smart TVs to electric bikes, explore our full range of
              premium products — all backed by genuine warranty and island-wide
              delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <button className="px-8 py-3.5 bg-[#0F2D5E] text-white rounded-xl font-semibold hover:bg-[#1a4a8a] transition-colors inline-flex items-center gap-2">
                  Explore Products <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-[#0F2D5E] hover:text-[#0F2D5E] transition-colors">
                  Get in Touch
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
