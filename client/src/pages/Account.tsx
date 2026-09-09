import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  User,
  Package,
  PackageX,
  Heart,
  LogOut,
  ShoppingBag,
  Settings,
  ChevronRight,
  CheckCircle,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import AuthForm from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, getProductImage } from "@/lib/data";
import { Link } from "wouter";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import SEO from "@/components/SEO";

type Tab = "overview" | "orders" | "wishlist" | "settings";

export default function Account() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  const isWishlistPath = location === "/wishlist";
  const urlTab = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("tab") as Tab | null) : null;

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (isWishlistPath || urlTab === "wishlist") return "wishlist";
    if (location === "/my-orders" || urlTab === "orders") return "orders";
    if (urlTab && ["overview", "orders", "wishlist", "settings"].includes(urlTab)) return urlTab;
    return "overview";
  });

  const { items: wishlistItems, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  // Detect Google OAuth callback handshake
  const [oauthChecking, setOauthChecking] = useState(() => {
    if (typeof window === "undefined") return false;
    const search = window.location.search;
    const hash = window.location.hash;
    return search.includes("code=") || hash.includes("access_token=");
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get("error_description") || urlParams.get("error");
    if (oauthError) {
      toast.error(`Google Sign-In notice: ${oauthError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      setOauthChecking(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setOauthChecking(false);
      if (
        window.location.search.includes("code=") ||
        window.location.hash.includes("access_token=")
      ) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isAuthenticated]);

  const isAuthRoute =
    location === "/login" ||
    location === "/signin" ||
    location === "/register" ||
    location === "/signup";

  const { data: orders } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // If user is already authenticated and visits /login or /signin, redirect to /account
  useEffect(() => {
    if (isAuthenticated && isAuthRoute) {
      navigate("/account");
    }
  }, [isAuthenticated, isAuthRoute, navigate]);

  if (oauthChecking) {
    return (
      <MainLayout>
        <SEO title="Connecting with Google" noindex />
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#0052B4] border-t-transparent animate-spin" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Connecting with Google Account...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Please wait while your secure session is initialized
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show loading skeleton only on /account when fetching user data
  if (loading && !isAuthRoute && isAuthenticated === false && user !== null) {
    return (
      <MainLayout>
        <div className="container py-10">
          <Skeleton className="h-32 w-full rounded-2xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <div className="lg:col-span-3">
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Keep activeTab synchronized with URL query params and route changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as Tab | null;
    if (location === "/wishlist" || tabParam === "wishlist") {
      setActiveTab("wishlist");
    } else if (location === "/my-orders" || tabParam === "orders") {
      setActiveTab("orders");
    } else if (tabParam && ["overview", "orders", "wishlist", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  const isWishlistRoute =
    location === "/wishlist" ||
    activeTab === "wishlist" ||
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("tab") === "wishlist");

  if (!isAuthenticated && !isWishlistRoute) {
    return (
      <MainLayout>
        <SEO
          title={isAuthRoute ? "Sign In & Create Account" : "Customer Portal & Login"}
          description="Log in or create a customer account with Manju Group to track orders, manage warranty claims, and access exclusive member benefits."
          canonical="/login"
          noindex
        />
        <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2">
          {/* Left — navy branding panel */}
          <div
            className="hidden lg:flex flex-col justify-between p-14 text-white"
            style={{ backgroundColor: "#0F2D5E" }}
          >
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "#C9A84C" }}
              >
                Manju Group
              </div>
              <div className="text-white/40 text-xs mb-10">
                Quality You Can Always Trust
              </div>
              <h2 className="text-3xl font-bold font-display leading-snug mb-6">
                Sri Lanka's Most Trusted Multi-Brand Group
              </h2>
              <p className="text-white/50 leading-relaxed text-sm mb-8">
                Access exclusive member benefits, track your orders, and manage
                your wishlist — all in one place.
              </p>
              <div className="space-y-3">
                {[
                  "Island-wide delivery across all 25 districts",
                  "Genuine manufacturer-backed warranty",
                  "Dedicated 7-day customer support",
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={15} style={{ color: "#C9A84C" }} />
                    <span className="text-white/70 text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { value: "15+", label: "Years of Trust" },
                  { value: "5", label: "Premium Brands" },
                  { value: "50K+", label: "Happy Customers" },
                  { value: "8+", label: "Showrooms" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="border border-white/10 rounded-xl p-4 bg-white/5"
                  >
                    <div
                      className="text-2xl font-bold font-display"
                      style={{ color: "#C9A84C" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-white/40 text-xs mt-0.5">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-xs italic">
                "The Dew Plus TV quality is incredible — Manju Group delivers on
                every promise."
              </p>
            </div>
          </div>

          {/* Right — sign-in form */}
          <div className="flex items-center justify-center p-8 lg:p-14 bg-white">
            <AuthForm />
          </div>
        </div>
      </MainLayout>
    );
  }

  const TABS = [
    { id: "overview" as Tab, label: "Overview", icon: <User size={16} /> },
    {
      id: "orders" as Tab,
      label: "My Orders",
      icon: <Package size={16} />,
      count: orders?.length,
    },
    {
      id: "wishlist" as Tab,
      label: "Wishlist",
      icon: <Heart size={16} />,
      count: wishlistItems?.length,
    },
    { id: "settings" as Tab, label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <MainLayout>
      <SEO
        title="My Account & Orders"
        description="Manage your Manju Group customer profile, track placed orders, view wishlist items, and update delivery settings."
        canonical="/account"
        noindex
      />
      {/* Profile Header */}
      <div className="border-b border-white/10 py-8 bg-gradient-to-b from-white/5 to-transparent">
        <div className="container">
          <div
            className="rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 border border-white/15 shadow-2xl relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,45,94,0.9) 0%, rgba(10,25,50,0.95) 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-[#0F2D5E] font-display flex-shrink-0 shadow-lg"
                style={{ backgroundColor: "#C9A84C" }}
              >
                {isAuthenticated ? user?.name?.charAt(0).toUpperCase() || "U" : <Heart size={28} className="text-[#0F2D5E]" />}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                  {isAuthenticated ? user?.name || "Customer Account" : "My Saved Wishlist"}
                </h1>
                <p className="text-white/70 text-sm mt-0.5 font-medium">
                  {isAuthenticated ? user?.email : "Guest Session • Saved in this browser"}
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-bold text-[#C9A84C] capitalize">
                  <CheckCircle size={13} className="text-[#C9A84C]" />
                  {isAuthenticated ? `${user?.role || "customer"} Member` : "Guest Wishlist"}
                </div>
              </div>
            </div>

            {/* Quick action in header */}
            <div className="flex items-center gap-3">
              <Link href="/products">
                <Button className="bg-[#C9A84C] hover:bg-[#b89539] text-[#0F2D5E] font-bold text-xs h-10 px-5 rounded-xl shadow-md flex items-center gap-2">
                  <ShoppingBag size={15} /> Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md p-2 space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (!isAuthenticated && tab.id !== "wishlist") {
                      navigate("/login");
                      return;
                    }
                    setActiveTab(tab.id);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-[#0F2D5E] text-white shadow-sm font-bold"
                      : "text-[#333333] hover:bg-slate-100 hover:text-[#0a0a0a]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon} {tab.label}
                  </div>
                  <div className="flex items-center gap-2">
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`text-xs rounded-full px-2 py-0.5 font-bold ${
                          activeTab === tab.id
                            ? "bg-[#C9A84C] text-[#0F2D5E]"
                            : "bg-slate-200 text-[#1a1a1a]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                    <ChevronRight
                      size={14}
                      className={
                        activeTab === tab.id
                          ? "text-white/70"
                          : "text-[#888888]"
                      }
                    />
                  </div>
                </button>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      toast.success("Signed out successfully");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0052B4] hover:bg-blue-800 rounded-xl transition-colors shadow-sm"
                  >
                    <User size={14} /> Sign In to Your Account
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="mb-2">
                  <h2 className="text-2xl font-black font-display text-[#0F2D5E] tracking-tight">
                    Account Overview
                  </h2>
                  <p className="text-[#555555] text-xs font-medium mt-0.5">
                    Welcome back to your Manju Group member dashboard
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Total Orders",
                      value: orders?.length || 0,
                      icon: <ShoppingBag size={20} />,
                      bgColor: "rgba(15,45,94,0.1)",
                      iconColor: "#0F2D5E",
                    },
                    {
                      label: "Wishlist Items",
                      value: wishlistItems?.length || 0,
                      icon: <Heart size={20} />,
                      bgColor: "#fef2f2",
                      iconColor: "#ef4444",
                    },
                    {
                      label: "Account Status",
                      value: "Active Member",
                      icon: <User size={20} />,
                      bgColor: "#f0fdf4",
                      iconColor: "#16a34a",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: stat.bgColor,
                          color: stat.iconColor,
                        }}
                      >
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-xs text-[#555555] font-bold uppercase tracking-wider">
                          {stat.label}
                        </div>
                        <div className="text-xl font-extrabold text-[#0a0a0a] mt-0.5">
                          {stat.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {orders && orders.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-extrabold text-[#0F2D5E] text-base">
                        Recent Orders
                      </h3>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-xs font-bold text-[#0F2D5E] hover:underline"
                      >
                        View All ({orders.length}) →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order: any) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
                        >
                          <div>
                            <div className="text-sm font-bold text-[#0a0a0a]">
                              #{order.orderNumber}
                            </div>
                            <div className="text-xs text-[#555555] font-medium mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-[#F85606]">
                              {formatPrice(
                                Number(order.totalAmount || order.total)
                              )}
                            </div>
                            <span
                              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold capitalize mt-1 inline-block ${
                                order.status === "delivered"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-black font-display text-[#0F2D5E] tracking-tight">
                      My Orders ({orders?.length || 0})
                    </h2>
                    <p className="text-[#555555] text-xs font-medium mt-0.5">
                      Track your purchases and view order history
                    </p>
                  </div>
                  <Link href="/products">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold text-[#0F2D5E] bg-white hover:bg-slate-50 border-slate-300 rounded-xl px-4 h-9 flex items-center gap-1.5"
                    >
                      + Shop More
                    </Button>
                  </Link>
                </div>
                {orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <Link key={order.id} href={`/account/orders/${order.id}`}>
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all">
                          {/* Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-[#0a0a0a] text-sm">
                                  #{order.orderNumber}
                                </span>
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold capitalize ${
                                    order.status === "delivered"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : order.status === "shipped"
                                        ? "bg-purple-100 text-purple-800"
                                        : order.status === "processing"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-amber-100 text-amber-900"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-[#444444] font-semibold mt-0.5">
                                Placed on{" "}
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="text-base font-black text-[#F85606]">
                                {formatPrice(
                                  Number(order.totalAmount || order.total)
                                )}
                              </div>
                              <span className="text-[11px] text-[#555555] font-semibold uppercase">
                                {order.paymentMethod === "bank"
                                  ? "Bank Transfer"
                                  : "Cash on Delivery"}
                              </span>
                            </div>
                          </div>

                          {/* Items list */}
                          {order.items && order.items.length > 0 && (
                            <div className="space-y-2.5 pt-1">
                              {order.items.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 py-1.5"
                                >
                                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                                    <img
                                      src={getProductImage(
                                        item.imageUrl,
                                        item.productName
                                      )}
                                      alt={item.productName || ""}
                                      className="w-full h-full object-cover"
                                      onError={e => {
                                        (e.target as HTMLImageElement).src =
                                          "/manju-logo-circle.webp";
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[#0a0a0a] line-clamp-1">
                                      {item.productName}
                                    </p>
                                    <p className="text-xs text-[#444444] font-medium">
                                      Qty: {item.quantity} ×{" "}
                                      {formatPrice(Number(item.unitPrice))}
                                    </p>
                                  </div>
                                  <div className="text-xs font-black text-[#0a0a0a] flex-shrink-0">
                                    {formatPrice(
                                      Number(item.unitPrice) * item.quantity
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<PackageX size={28} />}
                    title="No orders yet"
                    description="Start shopping to see your orders here."
                    action={
                      <Link href="/products">
                        <Button
                          className="text-white"
                          style={{ backgroundColor: "#0F2D5E" }}
                        >
                          Browse Products
                        </Button>
                      </Link>
                    }
                    className="bg-white border border-gray-100 rounded-2xl"
                  />
                )}
              </motion.div>
            )}

            {activeTab === "wishlist" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-black font-display text-[#0F2D5E] tracking-tight">
                      My Wishlist ({wishlistItems?.length || 0})
                    </h2>
                    <p className="text-[#555555] text-xs font-medium mt-0.5">
                      Products you've saved for future purchase
                    </p>
                  </div>
                  <Link href="/products">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold text-[#0F2D5E] bg-white hover:bg-slate-50 border-slate-300 rounded-xl px-4 h-9 flex items-center gap-1.5"
                    >
                      + Explore Products
                    </Button>
                  </Link>
                </div>

                {!isAuthenticated && (
                  <div className="bg-amber-50/90 border border-amber-200 text-amber-900 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="text-base">💡</span>
                      <span>You are viewing items saved in this browser. Sign in to sync your wishlist across all your devices.</span>
                    </div>
                    <Link href="/login">
                      <Button size="sm" className="bg-[#0052B4] hover:bg-blue-800 text-white text-xs font-bold rounded-xl h-8 px-3 shrink-0">
                        Sign In / Register
                      </Button>
                    </Link>
                  </div>
                )}
                {wishlistItems && wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          <Link href={`/products/${item.productSlug}`}>
                            <div className="h-40 bg-slate-50 relative p-3 flex items-center justify-center border-b border-slate-100 cursor-pointer">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName || ""}
                                  className="w-full h-full object-contain"
                                  onError={e => {
                                    (e.target as HTMLImageElement).src =
                                      "/manju-logo-circle.webp";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#888888]">
                                  <Package size={32} />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(
                                    item.productId,
                                    item.productName
                                  );
                                }}
                                aria-label="Remove from wishlist"
                                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 shadow-xs flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </Link>

                          <div className="p-3.5 space-y-1">
                            <span className="text-[10px] font-bold text-[#0F2D5E] uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">
                              {item.brandName}
                            </span>
                            <Link href={`/products/${item.productSlug}`}>
                              <h3 className="text-xs font-bold text-[#0a0a0a] line-clamp-2 hover:text-[#0F2D5E] transition-colors cursor-pointer">
                                {item.productName}
                              </h3>
                            </Link>
                            <div className="text-sm font-black text-[#F85606] pt-1">
                              {formatPrice(Number(item.basePrice))}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 pt-0">
                          <Button
                            size="sm"
                            onClick={() =>
                              addItem(
                                item.productId,
                                Number(item.basePrice),
                                item.productName,
                                undefined,
                                1,
                                true
                              )
                            }
                            className="w-full bg-[#0F2D5E] hover:bg-[#1a4a8a] text-white text-xs font-bold h-9 rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <ShoppingCart size={13} /> Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Heart size={28} />}
                    title="Your wishlist is empty"
                    description="Save products you love for later."
                    action={
                      <Link href="/products">
                        <Button
                          className="text-white"
                          style={{ backgroundColor: "#0F2D5E" }}
                        >
                          Discover Products
                        </Button>
                      </Link>
                    }
                    className="bg-white border border-gray-100 rounded-2xl"
                  />
                )}
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-5">
                  <h2 className="text-2xl font-black font-display text-[#0F2D5E] tracking-tight">
                    Account Settings
                  </h2>
                  <p className="text-[#555555] text-xs font-medium mt-0.5">
                    Your personal profile information
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                  {[
                    { label: "Full Name", value: user?.name },
                    { label: "Email Address", value: user?.email },
                    { label: "Account Role", value: user?.role },
                    {
                      label: "Member Since",
                      value: user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : undefined,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="pb-3 border-b border-slate-100 last:border-0 last:pb-0"
                    >
                      <div className="text-xs font-bold text-[#555555] uppercase tracking-wider mb-1">
                        {label}
                      </div>
                      <div className="text-sm font-extrabold text-[#0a0a0a] capitalize">
                        {value || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
