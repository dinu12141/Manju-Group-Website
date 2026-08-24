import { useState } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const NAV_COLUMNS = [
  {
    heading: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Our Brands", href: "/brands" },
      { label: "Showrooms", href: "/locations" },
    ],
  },
  {
    heading: "Products",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Electric Bikes", href: "/products?categoryId=1" },
      { label: "Smart TVs", href: "/products?categoryId=2" },
      { label: "Air Conditioners", href: "/products?categoryId=3" },
      { label: "Water Purifiers", href: "/products?categoryId=4" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Store Locations", href: "/locations" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    Icon: Facebook,
    href: "https://www.facebook.com/ManjuEnterprisesLK",
    label: "Facebook",
    enabled: true,
  },
  {
    Icon: Instagram,
    label: "Instagram",
    enabled: false,
  },
  {
    Icon: Twitter,
    label: "Twitter",
    enabled: false,
  },
  {
    Icon: Youtube,
    label: "YouTube",
    enabled: false,
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const wordmarkRef = useRef<HTMLDivElement>(null);
  const wordmarkInView = useInView(wordmarkRef, { once: true });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="w-full bg-gradient-to-b from-[#001A3D] to-[#001026] text-white border-t-2 border-[#0052B4] relative overflow-hidden font-sans">
      {/* ── Top vibrant glow divider ─────────────────────────── */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#0052B4] via-[#60A5FA] to-transparent shadow-[0_0_12px_rgba(96,165,250,0.6)]" />

      {/* ── Wordmark & Brand Identity block (Compact on Mobile) ── */}
      <motion.div
        ref={wordmarkRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={wordmarkInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center flex flex-col items-center py-6 px-4 md:py-10 md:px-6"
      >
        {/* Circular Official Logo */}
        <div className="mb-2.5 md:mb-3.5 inline-block">
          <img
            src="/manju-logo.webp"
            alt="Manju Group Official Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full shadow-[0_0_20px_rgba(0,82,180,0.6)] ring-2 ring-white/90 object-contain bg-[#0052B4]"
          />
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-none uppercase mb-1.5 md:mb-2 font-display">
          <span className="text-white">MANJU</span>
          <span className="text-[#60A5FA]"> GROUP</span>
        </h2>

        <p className="text-blue-200/80 text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider uppercase max-w-md md:max-w-xl mx-auto leading-relaxed px-2">
          Pioneering Manufacturing, Electronics &amp; Green Energy in Sri Lanka
        </p>
      </motion.div>

      {/* ── Thin Divider ───────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="border-t border-white/10 w-full" />
      </div>

      {/* ── Responsive Navigation & Newsletter Grid ────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Links */}
          <div>
            <p className="text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#93C5FD] mb-2.5 sm:mb-3">
              {NAV_COLUMNS[0].heading}
            </p>
            <ul className="space-y-1.5 sm:space-y-2">
              {NAV_COLUMNS[0].links.map(link => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-[13px] text-white/75 hover:text-white hover:translate-x-1 transition-all inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <p className="text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#93C5FD] mb-2.5 sm:mb-3">
              {NAV_COLUMNS[1].heading}
            </p>
            <ul className="space-y-1.5 sm:space-y-2">
              {NAV_COLUMNS[1].links.map(link => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-[13px] text-white/75 hover:text-white hover:translate-x-1 transition-all inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <p className="text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#93C5FD] mb-2.5 sm:mb-3">
              {NAV_COLUMNS[2].heading}
            </p>
            <ul className="space-y-1.5 sm:space-y-2">
              {NAV_COLUMNS[2].links.map(link => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-[13px] text-white/75 hover:text-white hover:translate-x-1 transition-all inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Newsletter (Full width on small phones, 1 col on desktop) */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <p className="text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#93C5FD] mb-2.5 sm:mb-3">
              Connect With Us
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 mb-3.5">
              {SOCIAL_LINKS.map(({ Icon, href, label, enabled }) =>
                enabled ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title="Manju Enterprises LK on Facebook"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-[#0052B4]/40 border border-[#60A5FA] text-white hover:bg-[#0052B4] hover:shadow-[0_0_12px_rgba(0,82,180,0.5)] transition-all cursor-pointer"
                  >
                    <Icon size={15} />
                  </a>
                ) : (
                  <div
                    key={label}
                    aria-label={label}
                    title={label}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/30 cursor-default"
                  >
                    <Icon size={15} />
                  </div>
                )
              )}
            </div>

            {/* Compact Newsletter Form */}
            <form onSubmit={handleSubscribe} className="w-full">
              {subscribed ? (
                <div className="p-2 rounded-lg bg-[#0052B4]/40 border border-[#60A5FA] text-white text-xs font-bold text-center">
                  ✓ Subscribed successfully!
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-white/10 border border-white/20 focus:border-[#60A5FA] rounded-lg px-3 py-1.5 sm:py-2 text-xs text-white placeholder:text-white/40 outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#0052B4] to-[#003F8A] hover:from-[#00479e] hover:to-[#003473] text-white rounded-lg px-3 py-1.5 sm:py-2 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-98"
                  >
                    <span>Subscribe</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar: Copyright & Attribution ────────────────── */}
      <div className="border-t border-white/10 py-3.5 px-4 pb-20 md:pb-3.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left text-[11px] sm:text-xs text-white/70">
          {/* Copyright */}
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#60A5FA]" />
            <span>© {new Date().getFullYear()} Manju Group. All Rights Reserved.</span>
          </div>

          {/* EchoMedia Attribution */}
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <a
              href="https://www.echomediaa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#60A5FA] hover:text-white font-bold transition-colors"
            >
              EchoMedia
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-3 text-[11px] text-white/60">
            {["Privacy Policy", "Terms of Service", "Warranty"].map(label => (
              <Link
                key={label}
                href="/about"
                className="hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
