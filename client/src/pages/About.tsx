import { motion } from "framer-motion";
import { Shield, Award, Users, Globe, CheckCircle } from "lucide-react";
import MainLayout from "@/components/MainLayout";
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
  { year: "2012", event: "Launched Manju Exercise Books brand" },
  { year: "2015", event: "Expanded to Manju Dew Super water filters" },
  { year: "2018", event: "Introduced Dew Plus Smart TVs" },
  { year: "2020", event: "Launched DEW+ Air Conditioners" },
  { year: "2022", event: "Dew Motors electric bikes introduced" },
  { year: "2024", event: "Opened 8th showroom island-wide" },
];

export default function About() {
  return (
    <MainLayout>
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy to-[#1a4a8a] py-16 text-white">
        <div className="container">
          <div className="text-amber text-xs font-bold uppercase tracking-wider mb-2">
            Our Story
          </div>
          <h1 className="text-4xl font-bold font-display mb-4">
            About Manju Group
          </h1>
          <p className="text-white/70 max-w-2xl text-base leading-relaxed">
            For over 15 years, Manju Group has been a trusted name in Sri Lankan
            homes, delivering quality products across five distinct categories —
            from electric mobility to home comfort.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-14">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-navy rounded-2xl p-8 text-white"
            >
              <div className="text-amber text-xs font-bold uppercase tracking-wider mb-2">
                Our Mission
              </div>
              <h2 className="text-2xl font-bold font-display mb-3">
                Empowering Sri Lankan Homes
              </h2>
              <p className="text-white/70 leading-relaxed">
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
              className="bg-gray-50 rounded-2xl p-8"
            >
              <div className="text-navy text-xs font-bold uppercase tracking-wider mb-2">
                Our Vision
              </div>
              <h2 className="text-2xl font-bold font-display text-gray-800 mb-3">
                Sri Lanka's #1 Multi-Brand Company
              </h2>
              <p className="text-gray-600 leading-relaxed">
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
      <section className="py-14 bg-gray-50">
        <div className="container">
          <div className="text-center mb-10">
            <div className="section-label">What Drives Us</div>
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-surface rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Brands */}
      <section className="py-14">
        <div className="container">
          <div className="text-center mb-10">
            <div className="section-label">Our Portfolio</div>
            <h2 className="section-title">Five Brands, One Promise</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEGA_MENU_BRANDS.map((brand, i) => (
              <Link key={brand.slug} href={`/brands/${brand.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-navy hover:text-white transition-all group cursor-pointer"
                >
                  <span className="text-3xl">{brand.icon}</span>
                  <div>
                    <div className="font-bold text-gray-800 group-hover:text-white">
                      {brand.name}
                    </div>
                    <div className="text-sm text-gray-500 group-hover:text-white/70">
                      {brand.tagline}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-14 bg-gray-50">
        <div className="container">
          <div className="text-center mb-10">
            <div className="section-label">Our Journey</div>
            <h2 className="section-title">Milestones & Achievements</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            {MILESTONES.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 mb-6"
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  {i < MILESTONES.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <div className="text-xs font-bold text-amber uppercase tracking-wider">
                    {m.year}
                  </div>
                  <div className="text-sm font-semibold text-gray-800 mt-0.5">
                    {m.event}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-navy text-white">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: "15+", label: "Years of Excellence" },
              { value: "50,000+", label: "Happy Customers" },
              { value: "8+", label: "Showrooms Nationwide" },
              { value: "5", label: "Premium Brands" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-bold text-amber font-display mb-1">
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
