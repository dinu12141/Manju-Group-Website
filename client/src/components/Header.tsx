import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  X,
  ChevronRight,
  PhoneCall,
  MapPin,
  Facebook,
  Sparkles,
  Zap,
  Tv,
  Wind,
  Droplets,
  Info,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { STATIC_PRODUCTS } from "@/lib/staticData";
import { useCart } from "@/contexts/CartContext";

const CATEGORY_ITEMS = [
  { label: "Electric Bikes", href: "/products?categoryId=1", icon: Zap, color: "text-amber-400" },
  { label: "Smart TVs", href: "/products?categoryId=2", icon: Tv, color: "text-blue-400" },
  { label: "Air Conditioners", href: "/products?categoryId=3", icon: Wind, color: "text-cyan-400" },
  { label: "Water Purifiers", href: "/products?categoryId=4", icon: Droplets, color: "text-teal-400" },
];

const BRAND_ITEMS = [
  { label: "Dew Motors", href: "/brands/dew-motors", desc: "Electric Mobility" },
  { label: "Dew Plus", href: "/brands/dew-plus", desc: "Smart 4K Televisions" },
  { label: "DEW+ AC", href: "/brands/dew-plus-ac", desc: "Inverter Cooling" },
  { label: "Manju Dew Super", href: "/brands/manju-dew-super", desc: "RO Water Systems" },
];

export default function Header() {
  const [location, navigate] = useLocation();
  const { itemCount, openDrawer } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close menu on page navigation
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchFocused(false);
  }, [location]);

  // Handle outside click to close search dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Real-time search suggestions with multi-word token matching
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 1) return [];

    const terms = q.split(/\s+/).filter(Boolean);

    return STATIC_PRODUCTS.filter(p => {
      const pName = (p.name || "").toLowerCase();
      const pBrand = (p.brandName || "").toLowerCase();
      const pDesc = (p.shortDescription || "").toLowerCase();
      const pSku = (p.sku || "").toLowerCase();
      const combined = `${pName} ${pBrand} ${pDesc} ${pSku}`;

      // Exclude stationery
      if (
        pName.includes("exercise") ||
        pName.includes("drawing book") ||
        pName.includes("ruled")
      ) {
        return false;
      }

      return terms.every(t => combined.includes(t));
    }).slice(0, 6);
  }, [searchQuery]);

  const handleSearchSubmit = (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : searchQuery).trim();
    if (q) {
      setIsSearchFocused(false);
      navigate(`/products?search=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
      <header className="w-full flex flex-col z-50 fixed top-0 left-0 right-0 shadow-lg font-sans bg-gradient-to-r from-[#003875] via-[#0052B4] to-[#003B7B] border-b border-[#004899]/60">
        {/* ── DESKTOP HEADER (md:flex) ──────────────────────────── */}
        <div className="hidden md:flex text-white w-full px-4 md:px-8 h-[66px] items-center justify-between gap-6 relative">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-3 group transition-transform duration-200 active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <img
                src="/manju-logo.png"
                alt="Manju Group Official Logo"
                className="h-11 w-11 md:h-12 md:w-12 rounded-full object-contain bg-[#0052B4] ring-2 ring-white/90 shadow-md group-hover:ring-white transition-all duration-300"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span
                  className="text-white text-[20px] md:text-[23px] font-black tracking-tight leading-none uppercase drop-shadow-sm"
                  style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
                >
                  MANJU <span className="text-[#60A5FA] font-extrabold">GROUP</span>
                </span>
              </div>
              <span className="text-[10px] md:text-[11px] text-blue-100/90 font-medium tracking-[0.14em] uppercase mt-0.5">
                Excellence &amp; Trust
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div ref={searchContainerRef} className="flex-1 max-w-[620px] relative z-50">
            <div className="flex items-center h-[42px] rounded-xl overflow-hidden bg-white shadow-md border border-blue-200/50 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
              <input
                type="text"
                placeholder="Search electric bikes, smart TVs, ACs, water filters..."
                className="flex-1 h-full px-4 text-[14px] outline-none placeholder:text-gray-400 font-medium min-w-0 text-slate-900 bg-white"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleSearchSubmit();
                  if (e.key === "Escape") setIsSearchFocused(false);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="h-full px-5 bg-gradient-to-r from-[#F85606] to-[#d64700] hover:from-[#ff641a] hover:to-[#e04d00] text-white flex items-center justify-center transition-all shrink-0 font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
              >
                <Search size={16} strokeWidth={2.5} />
                <span className="font-bold text-xs tracking-wider uppercase">Search</span>
              </button>
            </div>

            {/* Live Search Results Popup */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-900 animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-[#F85606]" />
                    Matching Products ({searchSuggestions.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Press Enter to view all</span>
                </div>
                {searchSuggestions.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
                    {searchSuggestions.map(product => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-blue-50/80 transition-colors cursor-pointer group"
                      >
                        <img
                          src={product.imageUrl || "/manju-logo.png"}
                          alt={product.name}
                          className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 p-0.5 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase text-[#0052B4] bg-blue-50 px-1.5 py-0.2 rounded shrink-0">
                              {product.brandName || "Manju"}
                            </span>
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {product.name}
                            </span>
                          </div>
                          <span className="text-xs font-black text-[#F85606] mt-0.5 block">
                            Rs. {Number(product.salePrice || product.basePrice).toLocaleString()}
                          </span>
                        </div>
                        <ChevronRight size={15} className="text-slate-400 group-hover:text-[#0052B4] shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center text-xs text-slate-500">
                    No matching products found for "{searchQuery}".
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="w-full py-2.5 bg-slate-100 hover:bg-[#0052B4] hover:text-white text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 border-t border-slate-200"
                >
                  <span>See all search results for "{searchQuery}"</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+94112345678"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
            >
              <PhoneCall size={14} className="text-emerald-400" />
              <span>+94 11 234 5678</span>
            </a>

            <button
              type="button"
              onClick={openDrawer}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F85606] text-white text-[10px] font-black px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-md">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Desktop 3-Lines Menu Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/20 flex items-center gap-2 cursor-pointer shadow-sm"
              title="Open Navigation Menu"
            >
              <Menu size={20} strokeWidth={2.4} />
              <span className="font-extrabold text-xs tracking-wider uppercase">Menu</span>
            </button>
          </div>
        </div>

        {/* ── MOBILE HEADER (< md) ────────────────────────────────── */}
        <div className="md:hidden flex flex-col w-full text-white px-3 py-2 space-y-2">
          {/* Row 1: ☰ Menu Button + Logo + Right Actions */}
          <div className="flex items-center justify-between gap-2 h-[42px]">
            {/* Left: 3-Lines Hamburger Menu Button + Logo */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/25 shadow-sm flex items-center justify-center cursor-pointer"
                aria-label="Open Navigation Menu"
                title="Navigation Menu"
              >
                <Menu size={22} strokeWidth={2.5} className="text-white" />
              </button>

              <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform">
                <img
                  src="/manju-logo.png"
                  alt="Manju Logo"
                  className="w-8 h-8 rounded-full object-contain bg-[#0052B4] ring-2 ring-white/90 shadow-sm"
                />
                <span
                  className="text-white text-[17px] font-black tracking-tight leading-none uppercase"
                  style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
                >
                  MANJU <span className="text-[#60A5FA] font-extrabold">GROUP</span>
                </span>
              </Link>
            </div>

            {/* Right: Hotline Call + Cart Badge */}
            <div className="flex items-center gap-1.5">
              <a
                href="tel:+94112345678"
                className="p-2 rounded-xl bg-emerald-600/90 text-white flex items-center justify-center shadow-sm active:scale-95"
                title="Call Hotline"
              >
                <PhoneCall size={16} />
              </a>

              <button
                type="button"
                onClick={openDrawer}
                className="relative p-2 rounded-xl bg-white/15 text-white flex items-center justify-center active:scale-95 cursor-pointer"
                title="Cart"
              >
                <ShoppingCart size={17} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F85606] text-white text-[9px] font-black min-w-[16px] h-[16px] flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Full-Width Search Input with Dropdown */}
          <div ref={searchContainerRef} className="w-full relative z-40">
            <div className="flex items-center h-[38px] rounded-xl overflow-hidden bg-white shadow-md border border-blue-200/50">
              <input
                type="text"
                placeholder="Search bikes, smart TVs, ACs, water filters..."
                className="flex-1 h-full px-3 text-[13px] outline-none placeholder:text-gray-400 font-medium text-slate-900 bg-white min-w-0"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleSearchSubmit();
                  if (e.key === "Escape") setIsSearchFocused(false);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-2 text-gray-400"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="h-full px-3.5 bg-gradient-to-r from-[#F85606] to-[#d64700] text-white flex items-center justify-center font-bold text-xs shrink-0"
              >
                <Search size={15} strokeWidth={2.5} />
              </button>
            </div>

            {/* Live Search Results Popup for Mobile */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-900 animate-in fade-in-50 duration-150">
                <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-[#F85606]" />
                    Matching Products ({searchSuggestions.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Press Enter</span>
                </div>
                {searchSuggestions.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto">
                    {searchSuggestions.map(product => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-2.5 p-2.5 hover:bg-blue-50 transition-colors"
                      >
                        <img
                          src={product.imageUrl || "/manju-logo.png"}
                          alt={product.name}
                          className="w-9 h-9 object-contain rounded-lg bg-white border border-slate-200 p-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-slate-900 truncate block">
                            {product.name}
                          </span>
                          <span className="text-xs font-black text-[#F85606] block">
                            Rs. {Number(product.salePrice || product.basePrice).toLocaleString()}
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No results for "{searchQuery}".
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 border-t border-slate-200"
                >
                  <span>View all results</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Slide-Out Full Navigation Menu Drawer ────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Slide-in Drawer from Left */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-[320px] sm:max-w-[360px] bg-white text-slate-900 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto no-scrollbar font-sans border-r border-slate-200"
            >
              {/* Drawer Top Header */}
              <div>
                <div className="bg-gradient-to-r from-[#003875] to-[#0052B4] text-white p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/manju-logo.png"
                      alt="Manju Logo"
                      className="w-9 h-9 rounded-full bg-white/20 p-0.5 ring-1 ring-white/50"
                    />
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-tight">
                        Manju Group
                      </h3>
                      <p className="text-[10px] text-blue-100 font-medium">
                        Navigation &amp; Services
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="p-4 space-y-5">
                  {/* Main Pages */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2 px-2">
                      Main Pages
                    </span>
                    <div className="space-y-1">
                      {[
                        { href: "/", label: "Home", icon: Sparkles },
                        { href: "/products", label: "All Products", icon: ShoppingBag },
                        { href: "/brands", label: "Our Brands", icon: Zap },
                        { href: "/about", label: "About Us", icon: Info },
                        { href: "/locations", label: "Showrooms & Branches", icon: MapPin },
                        { href: "/contact", label: "Contact Us & Support", icon: PhoneCall },
                      ].map(item => {
                        const IconComp = item.icon;
                        const isActive = location === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                              isActive
                                ? "bg-[#0052B4] text-white shadow-sm"
                                : "text-slate-700 hover:bg-slate-100 hover:text-[#0052B4]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <IconComp size={16} className={isActive ? "text-white" : "text-[#0052B4]"} />
                              <span>{item.label}</span>
                            </div>
                            <ChevronRight size={14} className={isActive ? "text-white" : "text-slate-400"} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shop by Category */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2 px-2">
                      Shop By Category
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORY_ITEMS.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-800 transition-colors"
                          >
                            <Icon size={15} className="text-[#0052B4] shrink-0" />
                            <span className="truncate">{cat.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Official Brands */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2 px-2">
                      Our 4 Brands
                    </span>
                    <div className="space-y-1.5">
                      {BRAND_ITEMS.map(b => (
                        <Link
                          key={b.href}
                          href={b.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
                        >
                          <div>
                            <span className="text-slate-900 block">{b.label}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{b.desc}</span>
                          </div>
                          <ChevronRight size={13} className="text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions & Hotline */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <a
                  href="tel:+94112345678"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <PhoneCall size={14} />
                  <span>Call Hotline: +94 11 234 5678</span>
                </a>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1 font-semibold">
                    <ShieldCheck size={14} className="text-blue-600" />
                    <span>Official Manju Portal</span>
                  </div>
                  <a
                    href="https://www.facebook.com/ManjuEnterprisesLK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0052B4] font-bold hover:underline flex items-center gap-1"
                  >
                    <Facebook size={13} />
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from slipping under fixed header */}
      <div className="h-[96px] md:h-[66px] w-full shrink-0"></div>
    </>
  );
}
