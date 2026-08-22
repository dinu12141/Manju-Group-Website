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
  Sparkles,
} from "lucide-react";

const NAV_COLUMNS = [
  {
    heading: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Our Brands", href: "/brands" },
      { label: "Island-Wide Showrooms", href: "/locations" },
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
      { label: "Frequently Asked Questions", href: "/faq" },
      { label: "Store Locator & Maps", href: "/locations" },
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
    label: "Instagram (Coming Soon)",
    enabled: false,
  },
  {
    Icon: Twitter,
    label: "Twitter (Coming Soon)",
    enabled: false,
  },
  {
    Icon: Youtube,
    label: "YouTube (Coming Soon)",
    enabled: false,
  },
];

const BRAND_BLUE = "#0052B4";
const BRAND_BLUE_LIGHT = "#60A5FA";
const BRAND_BLUE_GLOW = "rgba(0, 82, 180, 0.45)";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    },
  }),
};

function AnimatedColumn({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

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
    <footer
      style={{
        background: "linear-gradient(180deg, #001A3D 0%, #00122E 100%)",
        color: "#ffffff",
        borderTop: "2px solid #0052B4",
        position: "relative",
      }}
    >
      {/* ── Top separator line with vibrant cyan-blue glow ─────── */}
      <div
        style={{
          height: "2px",
          background: `linear-gradient(90deg, transparent 0%, #0052B4 25%, #60A5FA 50%, #0052B4 75%, transparent 100%)`,
          boxShadow: "0 0 16px rgba(96, 165, 250, 0.6)",
        }}
      />

      {/* ── Wordmark & Brand Identity block ─────────────────────── */}
      <motion.div
        ref={wordmarkRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={wordmarkInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="text-center flex flex-col items-center"
        style={{ padding: "64px 24px 44px" }}
      >
        {/* Official Circular Logo */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ marginBottom: "18px", display: "inline-block" }}
        >
          <img
            src="/manju-logo.png"
            alt="Manju Group Logo"
            className="w-16 h-16 rounded-full shadow-[0_0_30px_rgba(0,82,180,0.7)] ring-2 ring-white/90 object-contain bg-[#0052B4]"
          />
        </motion.div>

        <h2
          style={{
            fontSize: "clamp(2.4rem, 7vw, 5rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: "14px",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          <span style={{ color: "#ffffff" }}>MANJU</span>
          <span style={{ color: "#60A5FA" }}> GROUP</span>
        </h2>

        <p
          style={{
            color: "rgba(255, 255, 255, 0.75)",
            fontSize: "13px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 600,
            maxWidth: "640px",
          }}
        >
          Pioneering Manufacturing, Electronics &amp; Green Energy in Sri Lanka
        </p>
      </motion.div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "1200px",
          width: "100%",
          padding: "0 24px",
        }}
      />

      {/* ── 4-Column Navigation & Subscription Grid ─────────────── */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "54px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
        }}
      >
        {NAV_COLUMNS.map((col, i) => (
          <AnimatedColumn key={col.heading} index={i}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#93C5FD",
                marginBottom: "18px",
              }}
            >
              {col.heading}
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {col.links.map(link => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 500,
                      transition: "color 0.2s, transform 0.2s",
                      display: "inline-block",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.color = "#ffffff";
                      el.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.color = "rgba(255, 255, 255, 0.8)";
                      el.style.transform = "translateX(0px)";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </AnimatedColumn>
        ))}

        {/* Connect & Newsletter Column */}
        <AnimatedColumn index={3}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#93C5FD",
              marginBottom: "18px",
            }}
          >
            Connect With Us
          </p>

          {/* Social Icons */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            {SOCIAL_LINKS.map(({ Icon, href, label, enabled }) =>
              enabled ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title="Manju Enterprises LK on Facebook"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0, 82, 180, 0.4)",
                    border: "1px solid #60A5FA",
                    color: "#ffffff",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "#60A5FA";
                    el.style.background = "#0052B4";
                    el.style.boxShadow = `0 0 18px ${BRAND_BLUE_GLOW}`;
                    el.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "#60A5FA";
                    el.style.background = "rgba(0, 82, 180, 0.4)";
                    el.style.boxShadow = "none";
                    el.style.transform = "translateY(0px)";
                  }}
                >
                  <Icon size={17} />
                </a>
              ) : (
                <div
                  key={label}
                  aria-label={label}
                  title={label}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "rgba(255, 255, 255, 0.3)",
                    cursor: "default",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} />
                </div>
              )
            )}
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleSubscribe}>
            {subscribed ? (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "rgba(0, 82, 180, 0.35)",
                  border: "1px solid #60A5FA",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    padding: "11px 16px",
                    fontSize: "13px",
                    color: "#ffffff",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => {
                    (e.currentTarget as HTMLInputElement).style.borderColor =
                      "#60A5FA";
                    (e.currentTarget as HTMLInputElement).style.background =
                      "rgba(255, 255, 255, 0.12)";
                  }}
                  onBlur={e => {
                    (e.currentTarget as HTMLInputElement).style.borderColor =
                      "rgba(255, 255, 255, 0.2)";
                    (e.currentTarget as HTMLInputElement).style.background =
                      "rgba(255, 255, 255, 0.08)";
                  }}
                />
                <button
                  type="submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: `linear-gradient(135deg, ${BRAND_BLUE}, #003F8A)`,
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    padding: "11px 20px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    width: "100%",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.boxShadow = `0 0 24px ${BRAND_BLUE_GLOW}`;
                    el.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.boxShadow = "none";
                    el.style.transform = "scale(1)";
                  }}
                >
                  Join Newsletter <ArrowRight size={15} />
                </button>
              </div>
            )}
          </form>
        </AnimatedColumn>
      </div>

      {/* ── Bottom Bar: Copyright, Policies & EchoMedia Attribution ── */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(0, 8, 20, 0.6)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "22px 24px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          {/* Copyright & Security */}
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#60A5FA]" />
            <span
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              © {new Date().getFullYear()} Manju Group. All Rights Reserved.
            </span>
          </div>

          {/* Powered by EchoMedia */}
          <div className="flex items-center gap-1.5 text-xs">
            <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Powered by
            </span>
            <a
              href="https://www.echomediaa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline transition-colors ml-0.5"
              style={{
                color: "#60A5FA",
                textDecoration: "none",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = "#ffffff";
                el.style.textDecoration = "underline";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = "#60A5FA";
                el.style.textDecoration = "none";
              }}
            >
              EchoMedia
            </a>
          </div>

          {/* Legal Links */}
          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy Policy", "Terms of Service", "Warranty"].map(label => (
              <Link
                key={label}
                href="/about"
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "12px",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "#ffffff")
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(255, 255, 255, 0.6)")
                }
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
