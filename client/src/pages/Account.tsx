import { useState } from "react";
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
import { formatPrice } from "@/lib/data";
import { Link } from "wouter";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";

type Tab = "overview" | "orders" | "wishlist" | "settings";

export default function Account() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { items: wishlistItems, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const { data: orders } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
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

  if (!isAuthenticated) {
    return (
      <MainLayout>
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
      {/* Profile Header — navy card */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container">
          <div
            className="rounded-2xl px-8 py-10 flex items-center gap-6"
            style={{ backgroundColor: "#0F2D5E" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-[#0F2D5E] font-display flex-shrink-0"
              style={{ backgroundColor: "#C9A84C" }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-white">
                {user?.name || "Customer"}
              </h1>
              <p className="text-white/60 text-sm mt-0.5">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-semibold text-white/80 capitalize">
                {user?.role || "customer"} member
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 ${
                    activeTab === tab.id
                      ? "text-[#0F2D5E] font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  style={
                    activeTab === tab.id
                      ? { backgroundColor: "rgba(15,45,94,0.05)" }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon} {tab.label}
                  </div>
                  <div className="flex items-center gap-2">
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className="text-xs text-white rounded-full px-1.5 py-0.5"
                        style={{ backgroundColor: "#0F2D5E" }}
                      >
                        {tab.count}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-gray-500 font-medium" />
                  </div>
                </button>
              ))}
              <button
                onClick={() => {
                  logout();
                  toast.success("Signed out successfully");
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Total Orders",
                      value: orders?.length || 0,
                      icon: <ShoppingBag size={20} />,
                      bgColor: "rgba(15,45,94,0.08)",
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
                      value: "Active",
                      icon: <User size={20} />,
                      bgColor: "#f0fdf4",
                      iconColor: "#16a34a",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: stat.bgColor,
                          color: stat.iconColor,
                        }}
                      >
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-xs text-gray-700 font-medium">
                          {stat.label}
                        </div>
                        <div className="font-bold text-gray-800">
                          {stat.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {orders && orders.length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Recent Orders
                    </h3>
                    <div className="space-y-2">
                      {orders.slice(0, 3).map((order: any) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              #{order.orderNumber}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="text-sm font-bold"
                              style={{ color: "#0F2D5E" }}
                            >
                              {formatPrice(Number(order.totalAmount))}
                            </div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                order.status === "delivered"
                                  ? "bg-green-50 text-green-700"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-amber-50 text-amber-700"
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    My Orders ({orders?.length || 0})
                  </h2>
                  <Link href="/products">
                    <Button variant="outline" size="sm" className="text-xs font-bold text-[#0F2D5E] border-slate-300">
                      + Shop More
                    </Button>
                  </Link>
                </div>
                {orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div
                        key={order.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
                      >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">
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
                            <p className="text-xs text-slate-600 font-semibold mt-0.5">
                              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-black text-[#F85606]">
                              {formatPrice(Number(order.totalAmount || order.total))}
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold uppercase">
                              {order.paymentMethod === "bank" ? "Bank Transfer" : "Cash on Delivery"}
                            </span>
                          </div>
                        </div>

                        {/* Items list */}
                        {order.items && order.items.length > 0 && (
                          <div className="space-y-2.5 pt-1">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3 py-1.5">
                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                                  <img
                                    src={
                                      item.imageUrl ||
                                      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=80&q=75"
                                    }
                                    alt={item.productName || ""}
                                    className="w-full h-full object-cover"
                                    onError={e => {
                                      (e.target as HTMLImageElement).src =
                                        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=80&q=75";
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-900 line-clamp-1">
                                    {item.productName}
                                  </p>
                                  <p className="text-xs text-slate-600 font-medium">
                                    Qty: {item.quantity} × {formatPrice(Number(item.unitPrice))}
                                  </p>
                                </div>
                                <div className="text-xs font-black text-slate-900 flex-shrink-0">
                                  {formatPrice(Number(item.unitPrice) * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
                    className="bg-white border border-gray-100"
                  />
                )}
              </motion.div>
            )}

            {activeTab === "wishlist" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    My Wishlist ({wishlistItems?.length || 0})
                  </h2>
                  <Link href="/products">
                    <Button variant="outline" size="sm" className="text-xs font-bold text-[#0F2D5E] border-slate-300">
                      + Explore Products
                    </Button>
                  </Link>
                </div>
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
                                      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=75";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Package size={32} />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(item.productId, item.productName);
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
                              <h3 className="text-xs font-bold text-slate-900 line-clamp-2 hover:text-[#0F2D5E] transition-colors cursor-pointer">
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
                    className="bg-white border border-gray-100"
                  />
                )}
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Account Settings
                </h2>
                <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4 shadow-sm">
                  {[
                    { label: "Name", value: user?.name },
                    { label: "Email", value: user?.email },
                    { label: "Account Type", value: user?.role },
                    {
                      label: "Member Since",
                      value: user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : undefined,
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-xs font-semibold text-gray-700 font-medium uppercase mb-1">
                        {label}
                      </div>
                      <div className="text-sm text-gray-800 capitalize">
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
