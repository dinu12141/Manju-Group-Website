import { useState } from "react";
import { motion } from "framer-motion";
import { User, Package, Heart, LogOut, ShoppingBag, Settings, ChevronRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/data";
import { Link } from "wouter";
import { toast } from "sonner";

type Tab = "overview" | "orders" | "wishlist" | "settings";

export default function Account() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: orders } = trpc.orders.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: wishlist } = trpc.wishlist.list.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-10">
          <Skeleton className="h-32 w-full rounded-2xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <div className="lg:col-span-3"><Skeleton className="h-64 rounded-xl" /></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-20 text-center max-w-md mx-auto">
          <div className="text-7xl mb-6">👤</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Sign In to Your Account</h2>
          <p className="text-gray-500 text-sm mb-8">
            Access your order history, wishlist, and manage your profile.
          </p>
          <a href={getLoginUrl()}>
            <Button className="w-full bg-navy text-white h-12 font-semibold text-sm">
              Sign In with Manus
            </Button>
          </a>
        </div>
      </MainLayout>
    );
  }

  const TABS = [
    { id: "overview" as Tab, label: "Overview", icon: <User size={16} /> },
    { id: "orders" as Tab, label: "My Orders", icon: <Package size={16} />, count: orders?.length },
    { id: "wishlist" as Tab, label: "Wishlist", icon: <Heart size={16} />, count: wishlist?.length },
    { id: "settings" as Tab, label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <MainLayout>
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-navy to-[#1a4a8a] py-10 text-white">
        <div className="container flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">{user?.name || "Customer"}</h1>
            <p className="text-white/70 text-sm">{user?.email}</p>
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium capitalize">
              {user?.role || "customer"}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 ${
                    activeTab === tab.id ? "bg-navy/5 text-navy font-semibold" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon} {tab.label}
                  </div>
                  <div className="flex items-center gap-2">
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="text-xs bg-navy text-white rounded-full px-1.5 py-0.5">{tab.count}</span>
                    )}
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </button>
              ))}
              <button
                onClick={() => { logout(); toast.success("Signed out successfully"); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Total Orders", value: orders?.length || 0, icon: <ShoppingBag size={20} />, color: "bg-blue-50 text-blue-600" },
                    { label: "Wishlist Items", value: wishlist?.length || 0, icon: <Heart size={20} />, color: "bg-red-50 text-red-500" },
                    { label: "Account Status", value: "Active", icon: <User size={20} />, color: "bg-green/10 text-green" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
                      <div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                        <div className="font-bold text-gray-800">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {orders && orders.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Recent Orders</h3>
                    <div className="space-y-2">
                      {orders.slice(0, 3).map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <div className="text-sm font-medium text-gray-800">#{order.orderNumber}</div>
                            <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-navy">{formatPrice(Number(order.totalAmount))}</div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              order.status === "delivered" ? "bg-green/10 text-green" :
                              order.status === "processing" ? "bg-blue-100 text-blue-600" :
                              "bg-amber/20 text-amber-700"
                            }`}>
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
                <h2 className="text-lg font-bold text-gray-800 mb-4">My Orders</h2>
                {orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order: any) => (
                      <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-gray-800 text-sm">Order #{order.orderNumber}</span>
                            <span className="text-xs text-gray-400 ml-3">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            order.status === "delivered" ? "bg-green/10 text-green" :
                            order.status === "processing" ? "bg-blue-100 text-blue-600" :
                            order.status === "shipped" ? "bg-purple-100 text-purple-600" :
                            "bg-amber/20 text-amber-700"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">{order.items?.length || 0} item(s)</div>
                          <div className="font-bold text-navy">{formatPrice(Number(order.totalAmount))}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <div className="text-5xl mb-3">📦</div>
                    <h3 className="font-semibold text-gray-700 mb-2">No orders yet</h3>
                    <p className="text-sm text-gray-400 mb-4">Start shopping to see your orders here.</p>
                    <Link href="/products"><Button className="bg-navy text-white">Browse Products</Button></Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "wishlist" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-bold text-gray-800 mb-4">My Wishlist</h2>
                {wishlist && wishlist.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <Link key={item.id} href={`/products/${item.productSlug}`}>
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                          <div className="h-32 bg-gray-50">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName || ""} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200 text-3xl">📦</div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="text-xs text-gray-400 mb-0.5">{item.brandName}</div>
                            <div className="text-sm font-semibold text-gray-800 line-clamp-1">{item.productName}</div>
                            <div className="text-sm font-bold text-navy">{formatPrice(Number(item.basePrice))}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <div className="text-5xl mb-3">❤️</div>
                    <h3 className="font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
                    <p className="text-sm text-gray-400 mb-4">Save products you love for later.</p>
                    <Link href="/products"><Button className="bg-navy text-white">Discover Products</Button></Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Account Settings</h2>
                <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Name</div>
                    <div className="text-sm text-gray-800">{user?.name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</div>
                    <div className="text-sm text-gray-800">{user?.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Account Type</div>
                    <div className="text-sm text-gray-800 capitalize">{user?.role || "customer"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Member Since</div>
                    <div className="text-sm text-gray-800">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
