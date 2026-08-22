import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  PhoneCall,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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

  return (
    <>
      <header className="w-full flex flex-col z-50 fixed top-0 left-0 right-0 shadow-lg font-sans">
        {/* ── Top Bar — Brand Royal Blue ──────────────────────────── */}
        <div className="bg-gradient-to-r from-[#003875] via-[#0052B4] to-[#003B7B] text-white w-full px-3 sm:px-4 md:px-8 h-[60px] sm:h-[66px] flex items-center justify-between gap-2.5 sm:gap-4 md:gap-8 border-b border-[#004899]/60">
          {/* Official Brand Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 sm:gap-3 group transition-transform duration-200 active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <img
                src="/manju-logo.png"
                alt="Manju Group Official Logo"
                className="h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full object-contain bg-[#0052B4] ring-2 ring-white/90 shadow-md group-hover:ring-white transition-all duration-300"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span
                  className="text-white text-[16px] sm:text-[20px] md:text-[23px] font-black tracking-tight leading-none uppercase drop-shadow-sm"
                  style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
                >
                  MANJU{" "}
                  <span className="text-[#60A5FA] font-extrabold">GROUP</span>
                </span>
              </div>
              <span className="hidden xs:flex text-[9px] sm:text-[10px] md:text-[11px] text-blue-100/90 font-medium tracking-[0.14em] uppercase mt-0.5 items-center gap-1">
                <span>Excellence &amp; Trust</span>
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-[720px] flex items-center h-[38px] sm:h-[42px] rounded-lg overflow-hidden bg-white shadow-inner border border-blue-200/40 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
            <input
              type="text"
              placeholder="Search appliances, e-bikes..."
              className="flex-1 h-full px-3 sm:px-4 text-[12px] sm:text-[14px] outline-none placeholder:text-gray-400 font-medium min-w-0"
              style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleSearch}
              aria-label="Search"
              className="h-full px-3 sm:px-4 md:px-5 bg-gradient-to-r from-[#0052B4] to-[#003f8a] text-white flex items-center justify-center hover:from-[#00489e] hover:to-[#00336d] transition-all shrink-0 font-medium text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              <Search size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden md:inline font-semibold text-xs tracking-wider text-white">
                SEARCH
              </span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-white shrink-0">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-1 text-[13px] font-semibold text-blue-100 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10 cursor-pointer">
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
                <DropdownMenuItem disabled className="text-sm opacity-50 cursor-not-allowed rounded-lg px-3 py-2 text-gray-400 flex items-center justify-between">
                  <span>Tamil (தமிழ்)</span>
                  <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-semibold">Soon</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart Button */}
            <button
              type="button"
              onClick={openDrawer}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-white cursor-pointer focus-visible:outline-none"
              title="Shopping Cart"
            >
              <ShoppingCart
                size={20}
                strokeWidth={2.2}
                className="text-white sm:w-[22px] sm:h-[22px]"
              />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-black px-1 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] flex items-center justify-center rounded-full shadow-md animate-in zoom-in-75">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Store Locations Link */}
            <Link
              href="/locations"
              className="hidden sm:flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
              title="Branches & Showrooms"
            >
              <MapPin size={21} strokeWidth={2.2} className="text-white" />
            </Link>

            {/* User Profile */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs border border-white/40">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 bg-white text-gray-900 rounded-lg shadow-xl border border-gray-100 mt-2 p-1"
                >
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className="cursor-pointer text-sm px-3 py-2 hover:bg-gray-100 rounded block text-gray-800"
                    >
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 text-sm cursor-pointer hover:bg-red-50 rounded px-3 py-2 font-medium"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/account"
                className="flex items-center gap-1 text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20 cursor-pointer"
              >
                <User size={15} className="text-white" />
                <span className="hidden sm:inline text-white">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── Sub Navigation Bar ──────────────────────────────────── */}
        <div
          className="bg-white w-full px-2 sm:px-4 md:px-8 h-[44px] sm:h-[48px] flex items-center justify-between border-b border-gray-200 shadow-xs relative z-40 overflow-x-auto no-scrollbar"
          style={{ color: "#1e293b", backgroundColor: "#ffffff" }}
        >
          {/* Left: Social Media Links */}
          <div className="hidden md:flex items-center gap-2.5 pr-4 border-r border-gray-200 h-5 shrink-0">
            <a
              href="https://www.facebook.com/ManjuEnterprisesLK"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
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

          {/* Center Navigation Links — Smooth Scroll & Clean Touch targets on mobile */}
          <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-1 h-full max-w-5xl mx-auto px-1 overflow-x-auto no-scrollbar scroll-smooth">
            {navLinks.map(({ href, label, exact }) => {
              const active = isLinkActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 flex items-center justify-center py-1 sm:py-1.5 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl text-[12px] sm:text-[14px] font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-[#0052B4]/10 text-[#0052B4] border border-[#0052B4]/25 shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-[#0052B4]"
                  }`}
                >
                  <span style={{ color: active ? "#0052B4" : "#1e293b", fontWeight: active ? 800 : 700 }}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Hotline / Customer Helpline - Direct Click to Call */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-gray-200 h-5 shrink-0">
            <a
              href="tel:+94112345678"
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-[#0052B4] text-[#0052B4] hover:text-white px-3 py-1 rounded-full border border-blue-200 text-[11px] font-extrabold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
              title="Click to call Hotline"
            >
              <PhoneCall size={12} className="text-[#0052B4] group-hover:text-white transition-colors" />
              <span>Hotline: +94 11 234 5678</span>
            </a>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-[104px] sm:h-[114px] w-full shrink-0"></div>
    </>
  );
}
