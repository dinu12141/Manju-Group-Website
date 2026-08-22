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
  Home,
  Package,
  Share2,
  Info,
  Phone,
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
        <div className="bg-gradient-to-r from-[#003875] via-[#0052B4] to-[#003B7B] text-white w-full px-4 md:px-8 h-[66px] flex items-center justify-between gap-4 md:gap-8 border-b border-[#004899]/60">
          {/* Official Brand Logo */}
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
              <div className="flex items-center gap-1.5">
                <span
                  className="text-white text-[20px] md:text-[23px] font-black tracking-tight leading-none uppercase drop-shadow-sm"
                  style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
                >
                  MANJU{" "}
                  <span className="text-[#60A5FA] font-extrabold">GROUP</span>
                </span>
              </div>
              <span className="text-[10px] md:text-[11px] text-blue-100/90 font-medium tracking-[0.16em] uppercase mt-0.5 flex items-center gap-1">
                <span>Excellence &amp; Trust</span>
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-[720px] flex items-center h-[42px] rounded-lg overflow-hidden bg-white shadow-inner border border-blue-200/40 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
            <input
              type="text"
              placeholder="Search genuine appliances, electronics, solar, e-bikes..."
              className="flex-1 h-full px-4 text-[13px] md:text-[14px] outline-none placeholder:text-gray-400 font-medium"
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
              className="h-full px-4 md:px-5 bg-gradient-to-r from-[#0052B4] to-[#003f8a] text-white flex items-center justify-center hover:from-[#00489e] hover:to-[#00336d] transition-all shrink-0 font-medium text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              <Search size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline font-semibold text-xs tracking-wider text-white">
                SEARCH
              </span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 md:gap-6 text-white shrink-0">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-1 text-[13px] font-semibold text-blue-100 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10 cursor-pointer">
                  <span className="text-white">English</span>
                  <ChevronDown size={14} className="opacity-80 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white text-gray-900 rounded-lg shadow-xl border border-gray-100 mt-2 min-w-[120px] p-1 font-medium text-sm"
              >
                <DropdownMenuItem className="cursor-pointer text-sm font-semibold text-[#0052B4] bg-blue-50/60 rounded px-3 py-2">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-sm hover:bg-gray-100 rounded px-3 py-2 text-gray-800">
                  Sinhala (සිංහල)
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-sm hover:bg-gray-100 rounded px-3 py-2 text-gray-800">
                  Tamil (தமிழ்)
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
              <ShoppingCart
                size={22}
                strokeWidth={2.2}
                className="text-white"
              />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[11px] font-black px-1.5 min-w-[20px] h-[20px] flex items-center justify-center rounded-full shadow-md animate-in zoom-in-75">
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
                  <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs border border-white/40">
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
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20 cursor-pointer"
              >
                <User size={16} className="text-white" />
                <span className="hidden sm:inline text-white">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── Sub Navigation Bar ──────────────────────────────────── */}
        <div
          className="bg-white w-full px-4 md:px-8 h-[50px] flex items-center justify-between border-b border-gray-200 shadow-sm relative z-40"
          style={{ color: "#1e293b", backgroundColor: "#ffffff" }}
        >
          {/* Left: Social Media Links */}
          <div className="hidden md:flex items-center gap-2.5 pr-5 border-r border-gray-200 h-6 shrink-0">
            <a
              href="https://www.facebook.com/ManjuEnterprisesLK"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-1 text-[#0052B4] hover:text-[#003875] hover:scale-115 transition-all cursor-pointer"
              title="Manju Enterprises LK on Facebook"
            >
              <Facebook size={18} />
            </a>
            <span
              aria-label="Instagram"
              className="p-1 text-slate-500 cursor-default select-none transition-colors"
              title="Instagram (Coming Soon)"
            >
              <Instagram size={18} />
            </span>
            <span
              aria-label="Twitter"
              className="p-1 text-slate-500 cursor-default select-none transition-colors"
              title="Twitter (Coming Soon)"
            >
              <Twitter size={18} />
            </span>
            <span
              aria-label="YouTube"
              className="p-1 text-slate-500 cursor-default select-none transition-colors"
              title="YouTube (Coming Soon)"
            >
              <Youtube size={18} />
            </span>
          </div>

          {/* Center Navigation Links — Full Width Balanced & Evenly Distributed (Text Only) */}
          <nav className="flex items-center justify-around sm:justify-evenly gap-1 sm:gap-3 md:gap-6 flex-1 h-full max-w-5xl mx-auto px-2">
            {navLinks.map(({ href, label, exact }) => {
              const active = isLinkActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex-1 max-w-[160px] flex items-center justify-center py-2 px-2 sm:px-4 rounded-xl text-[14px] sm:text-[15px] font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-[#0052B4]/10 text-[#0052B4] border border-[#0052B4]/25 shadow-xs"
                      : "text-slate-700 hover:bg-slate-100/90 hover:text-[#0052B4]"
                  }`}
                  style={{
                    color: active ? "#0052B4" : "#1e293b",
                  }}
                >
                  <span
                    style={{
                      color: active ? "#0052B4" : "#1e293b",
                      fontWeight: active ? 800 : 700,
                    }}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Hotline / Customer Helpline */}
          <div className="hidden lg:flex items-center gap-2 pl-5 border-l border-gray-200 h-6 shrink-0">
            <span className="flex items-center gap-2 bg-blue-50/90 px-3.5 py-1.5 rounded-full border border-blue-200/80 shadow-xs text-xs font-extrabold text-[#0052B4]">
              <PhoneCall size={14} className="text-[#0052B4]" />
              <span>Hotline: +94 11 234 5678</span>
            </span>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-[114px] w-full shrink-0"></div>
    </>
  );
}
