import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown,
  MapPin, Phone, Mail, Heart, LogOut, Settings, Package
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { NAV_LINKS, MEGA_MENU_BRANDS, formatPrice } from "@/lib/data";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const { data: searchResults } = trpc.products.search.useQuery(
    { query: searchQuery, limit: 6 },
    { enabled: searchQuery.length > 1 }
  );

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar text-xs font-medium">
        <div className="container flex items-center justify-center gap-6 flex-wrap">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} /> Island-wide Delivery Across Sri Lanka
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Phone size={12} /> +94 11 234 5678
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <Mail size={12} /> info@manjugroup.lk
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100" style={{ boxShadow: "var(--shadow-nav)" }}>
        <div className="container">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white font-bold text-lg font-display">
                M
              </div>
              <div className="hidden sm:block">
                <div className="text-navy font-bold text-lg leading-tight font-display">Manju Group</div>
                <div className="text-xs text-gray-500 leading-tight">Quality You Can Trust</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 flex-1">
              {NAV_LINKS.map((link) => {
                if (link.label === "Brands") {
                  return (
                    <div
                      key="brands"
                      className="relative"
                      onMouseEnter={() => setMegaMenuOpen(true)}
                      onMouseLeave={() => setMegaMenuOpen(false)}
                    >
                      <button
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location.startsWith("/brands")
                            ? "text-navy bg-blue-50"
                            : "text-gray-700 hover:text-navy hover:bg-gray-50"
                        }`}
                      >
                        Brands <ChevronDown size={14} className={`transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {megaMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50"
                          >
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Our Brands</div>
                            {MEGA_MENU_BRANDS.map((brand) => (
                              <Link
                                key={brand.slug}
                                href={`/brands/${brand.slug}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                                onClick={() => setMegaMenuOpen(false)}
                              >
                                <span className="text-2xl">{brand.icon}</span>
                                <div>
                                  <div className="text-sm font-semibold text-gray-800 group-hover:text-navy">{brand.name}</div>
                                  <div className="text-xs text-gray-500">{brand.tagline}</div>
                                </div>
                              </Link>
                            ))}
                            <div className="border-t border-gray-100 mt-2 pt-2">
                              <Link
                                href="/brands"
                                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-navy hover:bg-blue-50 rounded-lg transition-colors"
                                onClick={() => setMegaMenuOpen(false)}
                              >
                                View All Brands →
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location === link.href
                        ? "text-navy bg-blue-50"
                        : "text-gray-700 hover:text-navy hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-navy hover:bg-gray-50 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Wishlist (authenticated only) */}
              {isAuthenticated && (
                <Link href="/account" className="p-2 rounded-lg text-gray-600 hover:text-navy hover:bg-gray-50 transition-colors hidden sm:flex">
                  <Heart size={20} />
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative p-2 rounded-lg text-gray-600 hover:text-navy hover:bg-gray-50 transition-colors">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-amber text-[10px] font-bold text-gray-900 rounded-full flex items-center justify-center min-w-[18px] min-h-[18px] px-1">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-navy hover:bg-gray-50 transition-colors hidden sm:flex">
                      <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                        {user?.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <span className="hidden md:block max-w-[100px] truncate">{user?.name?.split(" ")[0]}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-3 py-2 text-sm">
                      <div className="font-semibold text-gray-800">{user?.name}</div>
                      <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                        <User size={15} /> My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                        <Package size={15} /> My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                        <Heart size={15} /> Wishlist
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-navy font-medium">
                            <Settings size={15} /> Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer flex items-center gap-2">
                      <LogOut size={15} /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-navy text-white hover:bg-navy-light transition-colors"
                >
                  <User size={15} /> Sign In
                </a>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-navy hover:bg-gray-50 transition-colors">
                    <Menu size={22} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white font-bold text-sm">M</div>
                        <span className="font-bold text-navy font-display">Manju Group</span>
                      </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                      {NAV_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            location === link.href ? "text-navy bg-blue-50" : "text-gray-700 hover:text-navy hover:bg-gray-50"
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}

                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">Brands</div>
                        {MEGA_MENU_BRANDS.map((brand) => (
                          <Link
                            key={brand.slug}
                            href={`/brands/${brand.slug}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="text-xl">{brand.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-800">{brand.name}</div>
                              <div className="text-xs text-gray-500">{brand.tagline}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </nav>

                    <div className="p-4 border-t space-y-2">
                      {isAuthenticated ? (
                        <>
                          <Link href="/account" className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold" onClick={() => setMobileOpen(false)}>
                            <User size={15} /> My Account
                          </Link>
                          <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium">
                            <LogOut size={15} /> Sign Out
                          </button>
                        </>
                      ) : (
                        <a href={getLoginUrl()} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold">
                          <User size={15} /> Sign In / Register
                        </a>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <div className="container py-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, brands..."
                    className="pl-10 pr-10 h-11 border-gray-200 focus:border-navy"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </form>

                {/* Search Results Dropdown */}
                {searchQuery.length > 1 && searchResults && searchResults.length > 0 && (
                  <div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/products/${result.slug}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      >
                        {result.imageUrl ? (
                          <img src={result.imageUrl} alt={result.name} className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">IMG</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{result.name}</div>
                          <div className="text-xs text-gray-500">{result.brandName}</div>
                        </div>
                        <div className="text-sm font-semibold text-navy">
                          {formatPrice(result.salePrice ?? result.basePrice)}
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-navy hover:bg-blue-50 transition-colors"
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    >
                      View all results for "{searchQuery}" →
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
