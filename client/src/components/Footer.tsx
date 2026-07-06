import { Link } from "wouter";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from "lucide-react";
import { MEGA_MENU_BRANDS } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-[#0a1628] text-white">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="container py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
          {[
            { label: "Island-wide Delivery", detail: "All 25 districts" },
            { label: "Genuine Warranty", detail: "Manufacturer-backed" },
            { label: "5 Trusted Brands", detail: "One group, one promise" },
            { label: "Customer Support", detail: "7 days a week" },
          ].map(item => (
            <div key={item.label}>
              <div className="text-sm font-semibold text-white">
                {item.label}
              </div>
              <div className="text-xs text-white/50 mt-0.5">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-lg font-display">
                M
              </div>
              <div>
                <div className="font-bold text-lg font-display">
                  Manju Group
                </div>
                <div className="text-xs text-white/50">
                  Quality You Can Trust
                </div>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Sri Lanka's trusted multi-brand company delivering quality
              products across electric bikes, smart TVs, air conditioners, water
              filters, and educational stationery.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook size={15} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Youtube size={15} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Twitter size={15} />
              </a>
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Our Brands
            </h3>
            <ul className="space-y-2.5">
              {MEGA_MENU_BRANDS.map(brand => (
                <li key={brand.slug}>
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    <span>{brand.icon}</span> {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "All Products", href: "/products" },
                { label: "News & Blog", href: "/news" },
                { label: "Store Locations", href: "/locations" },
                { label: "FAQs", href: "/faq" },
                { label: "Contact Us", href: "/contact" },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin
                  size={15}
                  className="text-white/40 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-white/70">
                  No. 123, Galle Road, Colombo 03, Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-white/40 flex-shrink-0" />
                <a
                  href="tel:+94112345678"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-white/40 flex-shrink-0" />
                <a
                  href="mailto:info@manjugroup.lk"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  info@manjugroup.lk
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                Business Hours
              </h4>
              <div className="text-sm text-white/60 space-y-1">
                <div>Mon–Fri: 8:30 AM – 6:00 PM</div>
                <div>Saturday: 9:00 AM – 4:00 PM</div>
                <div>Sunday: Closed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <div>
            © {new Date().getFullYear()} Manju Group (Pvt) Ltd. All rights
            reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="hover:text-white/70 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/about"
              className="hover:text-white/70 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
