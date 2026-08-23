import { Link, useLocation } from "wouter";
import { Home, Package, Layers, MapPin, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { itemCount, openDrawer } = useCart();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", label: "Home", icon: Home, exact: true },
    { href: "/products", label: "Products", icon: Package },
    { href: "/brands", label: "Brands", icon: Layers },
    { href: "/account", label: isAuthenticated ? "Account" : "Sign In", icon: User },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) return location === href;
    return location === href || location.startsWith(`${href}/`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-pb">
      <nav className="flex items-center justify-around px-2 py-1.5 h-16 max-w-md mx-auto">
        {navItems.slice(0, 3).map(item => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                active ? "text-[#0052B4]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className={`relative p-1 rounded-full transition-transform ${active ? "scale-110" : ""}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0052B4]" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight transition-all ${active ? "font-black" : "font-semibold"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center Prominent Cart Button */}
        <button
          type="button"
          onClick={openDrawer}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 text-slate-500 hover:text-[#0052B4] cursor-pointer"
        >
          <div className="relative p-1">
            <ShoppingCart size={20} strokeWidth={2} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-[#F85606] text-white text-[9px] font-black min-w-[17px] h-[17px] flex items-center justify-center rounded-full shadow-sm animate-pulse">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight">Cart</span>
        </button>

        {/* Right Account / Sign In Button */}
        {navItems.slice(3).map(item => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                active ? "text-[#0052B4]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className={`relative p-1 rounded-full transition-transform ${active ? "scale-110" : ""}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0052B4]" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight transition-all ${active ? "font-black" : "font-semibold"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
