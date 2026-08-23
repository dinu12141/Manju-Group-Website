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
  Instagram,
  Twitter,
  Youtube,
  Sparkles,
  Zap,
  Tv,
  Wind,
  Droplets,
  Info,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  User,
  ChevronDown,
} from "lucide-react";
import { STATIC_PRODUCTS } from "@/lib/staticData";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORY_ITEMS = [
  {
    label: "Electric Bikes & Scooters",
    desc: "Dew Motors • 2400W & 2000W E-Bikes",
    href: "/products?categoryId=1",
    icon: Zap,
    badge: "Eco Fast",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
    iconBg: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    label: "4K Android Smart TVs",
    desc: "Dew Plus • 32\" to 98\" Frameless Cinema",
    href: "/products?categoryId=2",
    icon: Tv,
    badge: "Top Seller",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
    iconBg: "bg-blue-50 text-[#0052B4] border-blue-200",
  },
  {
    label: "Inverter Air Conditioners",
    desc: "DEW+ AC • 1.0T, 1.5T & 2.0T Split ACs",
    href: "/products?categoryId=3",
    icon: Wind,
    badge: "10-Yr Warranty",
    badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-200",
    iconBg: "bg-cyan-50 text-cyan-600 border-cyan-200",
  },
  {
    label: "RO Water Purifiers & Dispensers",
    desc: "Manju Dew Super • Alkaline Pure RO",
    href: "/products?categoryId=4",
    icon: Droplets,
    badge: "Healthy RO",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
];

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on navigation
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

  const navLinks = [
    { href: "/", label: "Home", exact: true },
    { href: "/products", label: "Products" },
    { href: "/brands", label: "Brands" },
    { href: "/about", label: "About Us" },
    { href: "/locations", label: "Showrooms" },
    { href: "/contact", label: "Contact" },
  ];

  const isLinkActive = (href: string, exact = false) => {
    if (exact) return location === href;
    return location === href || location.startsWith(`${href}/`);
  };

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
      <header className="w-full flex flex-col z-50 fixed top-0 left-0 right-0 shadow-lg font-sans">
        
        {/* ══════════════════════════════════════════════════════════════
            DESKTOP HEADER (md & up): Original 2-Tier Layout
        ══════════════════════════════════════════════════════════════ */}
        <div className="hidden md:flex flex-col w-full">
          {/* 1. Desktop Top Bar — Royal Blue */}
          <div className="bg-gradient-to-r from-[#003875] via-[#0052B4] to-[#003B7B] text-white w-full px-4 md:px-8 h-[66px] flex items-center justify-between gap-4 md:gap-8 border-b border-[#004899]/60">
            {/* Brand Logo */}
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

            {/* Desktop Smart Search Bar */}
            <div ref={searchContainerRef} className="flex-1 max-w-[680px] relative z-50">
              <div className="flex items-center h-[42px] rounded-xl overflow-hidden bg-white shadow-inner border border-blue-200/40 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <input
                  type="text"
                  placeholder="Search electric bikes, smart TVs, ACs, water filters..."
                  className="flex-1 h-full px-4 text-[14px] outline-none placeholder:text-gray-400 font-medium text-slate-900 bg-white min-w-0"
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
                  <span className="font-bold text-xs tracking-wider uppercase text-white">
                    SEARCH
                  </span>
                </button>
              </div>

              {/* Desktop Live Search Results Popup */}
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
            <div className="flex items-center gap-4 text-white shrink-0">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-[13px] font-semibold text-blue-100 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10 cursor-pointer">
                    <span className="text-white font-bold">English</span>
                    <ChevronDown size={14} className="opacity-80 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 mt-2 min-w-[150px] p-1 font-medium text-sm z-50"
                >
                  <DropdownMenuItem className="cursor-default text-sm font-bold text-[#0052B4] bg-blue-50/80 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span>English</span>
                    <span className="text-[10px] bg-[#0052B4] text-white px-1.5 py-0.5 rounded font-extrabold">Default</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-sm opacity-50 cursor-not-allowed rounded-lg px-3 py-2 text-gray-400 flex items-center justify-between">
                    <span>Sinhala (සිංහල)</span>
                    <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-semibold">Soon</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart Button */}
              <button
                type="button"
                onClick={openDrawer}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-white cursor-pointer focus-visible:outline-none"
                title="Shopping Cart"
              >
                <ShoppingCart size={22} className="text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[11px] font-black px-1 min-w-[20px] h-[20px] flex items-center justify-center rounded-full shadow-md">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Store Locations */}
              <Link
                href="/locations"
                className="hidden lg:flex items-center gap-1.5 text-[13px] font-bold text-white hover:text-blue-100 transition-colors py-1 px-2.5 rounded-lg hover:bg-white/10"
              >
                <MapPin size={15} className="text-blue-200" />
                <span>Showrooms</span>
              </Link>

              {/* Account / User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-white/10 transition-colors p-1.5 rounded-lg text-left cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-white text-[#0052B4] flex items-center justify-center font-bold text-xs shadow-sm">
                        {user?.name?.[0]?.toUpperCase() || <User size={16} />}
                      </div>
                      <span className="text-xs font-bold text-white max-w-[90px] truncate hidden xl:inline">
                        {user?.name?.split(" ")[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white text-gray-900 rounded-xl shadow-xl p-1.5 min-w-[170px] z-50">
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="font-bold text-xs text-slate-800 py-2 cursor-pointer">
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-orders" className="font-bold text-xs text-slate-800 py-2 cursor-pointer">
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="font-bold text-xs text-blue-600 py-2 cursor-pointer">
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => logout()} className="text-xs font-bold text-red-600 py-2 cursor-pointer">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all border border-white/20 shadow-xs active:scale-95"
                >
                  <User size={15} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>

          {/* 2. Desktop Bottom Sub-Navigation Bar — Crisp White with Social Media + Nav Links + Hotline */}
          <div className="bg-white border-b border-gray-200/90 text-gray-700 w-full px-4 md:px-8 h-[48px] flex items-center justify-between shadow-xs">
            {/* Left: Social Media Links */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200 h-5 shrink-0">
              <a
                href="https://www.facebook.com/ManjuEnterprisesLK"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-[#0052B4] hover:text-[#003875] hover:scale-115 transition-all cursor-pointer"
                title="Manju Enterprises LK on Facebook"
              >
                <Facebook size={16} />
              </a>
              <span
                aria-label="Instagram"
                className="p-1 text-slate-400 cursor-default select-none"
                title="Instagram"
              >
                <Instagram size={16} />
              </span>
              <span
                aria-label="Twitter"
                className="p-1 text-slate-400 cursor-default select-none"
                title="Twitter"
              >
                <Twitter size={16} />
              </span>
              <span
                aria-label="YouTube"
                className="p-1 text-slate-400 cursor-default select-none"
                title="YouTube"
              >
                <Youtube size={16} />
              </span>
            </div>

            {/* Center: Navigation Links — Perfectly Balanced & Evenly Distributed */}
            <nav className="flex items-center justify-evenly flex-1 max-w-4xl mx-auto px-2 lg:px-6 h-full">
              {navLinks.map(({ href, label, exact }) => {
                const active = isLinkActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center justify-center py-1.5 px-3.5 lg:px-5 rounded-xl text-[13px] lg:text-[14px] font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      active
                        ? "bg-[#0052B4]/10 text-[#0052B4] border border-[#0052B4]/20 shadow-2xs font-extrabold"
                        : "text-slate-700 hover:bg-slate-100 hover:text-[#0052B4]"
                    }`}
                  >
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Desktop Hotline Direct Link */}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200 h-5 shrink-0">
              <a
                href="tel:+94112345678"
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-[#0052B4] text-[#0052B4] hover:text-white px-3.5 py-1.5 rounded-full border border-blue-200 text-xs font-extrabold transition-all duration-200 active:scale-95"
              >
                <PhoneCall size={13} />
                <span>Hotline: +94 11 234 5678</span>
              </a>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MOBILE HEADER (< md): 2-Row Optimized Header with ☰ Menu
        ══════════════════════════════════════════════════════════════ */}
        <div className="md:hidden flex flex-col w-full text-white px-3.5 pt-[max(env(safe-area-inset-top,0px),8px)] pb-2.5 space-y-2 bg-gradient-to-r from-[#003875] via-[#0052B4] to-[#003B7B] border-b border-[#004899]/60 shadow-md">
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

          {/* Row 2: Full-Width Mobile Search Input with Dropdown */}
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

      {/* ── Mobile Slide-Out Full Navigation Menu Drawer ─────────── */}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Slide-in Drawer from Left */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-[320px] sm:max-w-[360px] bg-white text-slate-900 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto no-scrollbar font-sans border-r border-slate-200 md:hidden"
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

                  {/* Shop by Category - Luxury Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5 px-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Explore Categories
                      </span>
                      <span className="text-[10px] text-[#0052B4] font-bold">
                        4 Product Lines
                      </span>
                    </div>

                    <div className="space-y-2">
                      {CATEGORY_ITEMS.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="group p-3 bg-slate-50 hover:bg-blue-50/90 border border-slate-200/80 hover:border-blue-300 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer active:scale-98"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${cat.iconBg}`}
                              >
                                <Icon size={20} strokeWidth={2.2} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-slate-900 group-hover:text-[#0052B4] transition-colors truncate">
                                    {cat.label}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium block truncate">
                                  {cat.desc}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${cat.badgeColor}`}
                              >
                                {cat.badge}
                              </span>
                              <ChevronRight
                                size={15}
                                className="text-slate-400 group-hover:text-[#0052B4] group-hover:translate-x-0.5 transition-all"
                              />
                            </div>
                          </Link>
                        );
                      })}
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

      {/* Spacer to prevent page content from going under fixed header */}
      <div className="h-[104px] md:h-[114px] w-full shrink-0"></div>
    </>
  );
}
