import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Inbox,
  PackageX,
  UserX,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatPrice } from "@/lib/data";
import { toast } from "sonner";
import { Link } from "wouter";

type AdminTab = "dashboard" | "products" | "orders" | "customers";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

function orderStatusBadgeClass(status: string) {
  switch (status) {
    case "delivered":
      return "bg-green/10 text-green";
    case "processing":
      return "bg-blue-100 text-blue-600";
    case "shipped":
      return "bg-purple-100 text-purple-600";
    case "cancelled":
      return "bg-red-100 text-red-500";
    default:
      return "bg-amber/20 text-amber-700";
  }
}

/** Generic column definition for the shared AdminTable helper. */
type AdminTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  render: (row: T) => ReactNode;
};

/**
 * Shared table shell used by the Products, Orders and Customers tabs so all
 * three read from a single, consistent implementation instead of three
 * near-identical <table> blocks.
 */
function AdminTable<T extends { id: number | string }>({
  columns,
  rows,
}: {
  columns: AdminTableColumn<T>[];
  rows: T[];
}) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`text-left px-4 py-3 text-xs font-semibold text-gray-700 font-medium uppercase tracking-wide ${col.headerClassName ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr
                key={row.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors"
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.className ?? ""}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="card-surface overflow-hidden p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [productDialogId, setProductDialogId] = useState<number | "new" | null>(
    null
  );
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [orderDetailId, setOrderDetailId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: stats } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: recentOrders } = trpc.admin.recentOrders.useQuery(
    { limit: 5 },
    {
      enabled:
        isAuthenticated && user?.role === "admin" && activeTab === "dashboard",
    }
  );
  const { data: revenueChart } = trpc.admin.revenueChart.useQuery(undefined, {
    enabled:
      isAuthenticated && user?.role === "admin" && activeTab === "dashboard",
  });
  const { data: adminProducts } = trpc.admin.products.useQuery(
    { page: 1, limit: 20 },
    {
      enabled:
        isAuthenticated && user?.role === "admin" && activeTab === "products",
    }
  );
  const { data: adminOrders } = trpc.admin.orders.useQuery(
    { page: 1, limit: 20 },
    {
      enabled:
        isAuthenticated && user?.role === "admin" && activeTab === "orders",
    }
  );
  const { data: adminCustomers } = trpc.admin.customers.useQuery(
    { page: 1, limit: 20 },
    {
      enabled:
        isAuthenticated && user?.role === "admin" && activeTab === "customers",
    }
  );

  const updateOrderStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => toast.success("Order status updated"),
  });
  const toggleProductActive = trpc.admin.toggleProductActive.useMutation({
    onSuccess: () => {
      toast.success("Product updated");
      utils.admin.products.invalidate();
    },
  });
  const deleteProduct = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Product deleted");
      utils.admin.products.invalidate();
      setDeleteProductId(null);
    },
    onError: err => toast.error(err.message),
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-10">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-700 font-medium text-sm mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <Link href="/">
            <Button className="bg-navy text-white">Go Home</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const TABS = [
    {
      id: "dashboard" as AdminTab,
      label: "Dashboard",
      icon: <LayoutDashboard size={17} />,
    },
    {
      id: "products" as AdminTab,
      label: "Products",
      icon: <Package size={17} />,
    },
    {
      id: "orders" as AdminTab,
      label: "Orders",
      icon: <ShoppingCart size={17} />,
    },
    {
      id: "customers" as AdminTab,
      label: "Customers",
      icon: <Users size={17} />,
    },
  ];

  return (
    <MainLayout>
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container flex items-center justify-between">
          <div>
            <div className="text-gold text-xs font-bold uppercase tracking-widest mb-1">
              Admin Panel
            </div>
            <h1 className="text-2xl font-bold font-display text-gray-900">
              Manju Group Dashboard
            </h1>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Welcome, {user?.name}
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav
              aria-label="Admin sections"
              className="card-surface overflow-hidden p-1.5 flex flex-col gap-1"
            >
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-navy text-white font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={
                      activeTab === tab.id ? "text-amber" : "text-gray-600 font-medium"
                    }
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="lg:col-span-4">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Revenue",
                      value: stats ? formatPrice(stats.totalRevenue) : "—",
                      icon: <TrendingUp size={18} />,
                      color: "text-green bg-green/10",
                    },
                    {
                      label: "Total Orders",
                      value: stats?.totalOrders ?? "—",
                      icon: <ShoppingCart size={18} />,
                      color: "text-blue-600 bg-blue-50",
                    },
                    {
                      label: "Products",
                      value: stats?.totalProducts ?? "—",
                      icon: <Package size={18} />,
                      color: "text-purple-600 bg-purple-50",
                    },
                    {
                      label: "Customers",
                      value: stats?.totalCustomers ?? "—",
                      icon: <Users size={18} />,
                      color: "text-amber-600 bg-amber/20",
                    },
                  ].map((stat, i) => (
                    <div key={i} className="card-surface p-4">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}
                      >
                        {stat.icon}
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-700 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Order Status Summary */}
                {stats && (
                  <div className="card-surface p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Order Status Overview
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          label: "Total Orders",
                          value: stats.totalOrders,
                          color: "bg-amber/10 text-amber-700",
                          icon: <Clock size={14} />,
                        },
                        {
                          label: "Products",
                          value: stats.totalProducts,
                          color: "bg-blue-50 text-blue-600",
                          icon: <Settings size={14} />,
                        },
                        {
                          label: "Customers",
                          value: stats.totalCustomers,
                          color: "bg-purple-50 text-purple-600",
                          icon: <Package size={14} />,
                        },
                        {
                          label: "Revenue",
                          value: formatPrice(stats.totalRevenue),
                          color: "bg-green/10 text-green",
                          icon: <CheckCircle size={14} />,
                        },
                      ].map((s, i) => (
                        <div key={i} className={`rounded-lg p-3 ${s.color}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            {s.icon}
                            <span className="text-xs font-medium">
                              {s.label}
                            </span>
                          </div>
                          <div className="text-xl font-bold">{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Revenue Chart */}
                {revenueChart && revenueChart.length > 0 && (
                  <div className="card-surface p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <BarChart3 size={16} className="text-navy" /> Revenue
                      (Last 6 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={(revenueChart ?? []).map(r => ({
                          label: new Date(r.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          }),
                          revenue: Number(r.revenue) || 0,
                          orders: Number(r.count) || 0,
                        }))}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#6b7280" }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#6b7280" }}
                          tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          formatter={(v: number) => [
                            `LKR ${v.toLocaleString()}`,
                            "Revenue",
                          ]}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#0F2D5E"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Recent Orders */}
                <div className="card-surface p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">
                      Recent Orders
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="text-xs text-navy font-medium flex items-center gap-1"
                    >
                      View All <ChevronRight size={12} />
                    </button>
                  </div>
                  {recentOrders && recentOrders.length > 0 ? (
                    <div className="space-y-2">
                      {recentOrders.map((order: any) => (
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
                            <div className="text-sm font-bold text-navy">
                              {formatPrice(Number(order.total))}
                            </div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusBadgeClass(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentOrders ? (
                    <EmptyState
                      icon={<Inbox size={22} />}
                      title="No orders yet"
                      description="New orders will show up here as customers check out."
                    />
                  ) : (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Products</h2>
                  <Button
                    className="bg-navy text-white text-sm flex items-center gap-2"
                    onClick={() => setProductDialogId("new")}
                  >
                    <Plus size={15} /> Add Product
                  </Button>
                </div>
                {!adminProducts ? (
                  <TableSkeleton />
                ) : adminProducts.items.length === 0 ? (
                  <div className="card-surface">
                    <EmptyState
                      icon={<PackageX size={22} />}
                      title="No products yet"
                      description="Add your first product to start populating the storefront."
                      action={
                        <Button
                          className="bg-navy text-white"
                          onClick={() => setProductDialogId("new")}
                        >
                          <Plus size={15} className="mr-1.5" /> Add Product
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <AdminTable
                    rows={adminProducts.items}
                    columns={[
                      {
                        key: "product",
                        header: "Product",
                        render: (product: any) => (
                          <>
                            <div className="font-medium text-gray-800 line-clamp-1">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                              {product.sku}
                            </div>
                          </>
                        ),
                      },
                      {
                        key: "brand",
                        header: "Brand",
                        headerClassName: "hidden sm:table-cell",
                        className: "text-gray-600 hidden sm:table-cell",
                        render: (product: any) => product.brandName,
                      },
                      {
                        key: "price",
                        header: "Price",
                        className: "font-semibold text-navy",
                        render: (product: any) =>
                          formatPrice(Number(product.basePrice)),
                      },
                      {
                        key: "stock",
                        header: "Stock",
                        headerClassName: "hidden md:table-cell",
                        className: "hidden md:table-cell",
                        render: (product: any) => (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.isInStock ? "bg-green/10 text-green" : "bg-red-100 text-red-500"}`}
                          >
                            {product.isInStock ? "In Stock" : "Out of Stock"}
                          </span>
                        ),
                      },
                      {
                        key: "active",
                        header: "Active",
                        headerClassName: "hidden md:table-cell",
                        className: "hidden md:table-cell",
                        render: (product: any) => (
                          <Switch
                            checked={product.isActive}
                            aria-label={`${product.isActive ? "Deactivate" : "Activate"} ${product.name}`}
                            onCheckedChange={checked =>
                              toggleProductActive.mutate({
                                productId: product.id,
                                isActive: checked,
                              })
                            }
                          />
                        ),
                      },
                      {
                        key: "actions",
                        header: "Actions",
                        headerClassName: "text-right",
                        className: "text-right",
                        render: (product: any) => (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              aria-label={`Edit ${product.name}`}
                              className="p-1.5 text-gray-600 font-medium hover:text-navy hover:bg-navy/5 rounded-md transition-colors"
                              onClick={() => setProductDialogId(product.id)}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${product.name}`}
                              className="p-1.5 text-gray-600 font-medium hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              onClick={() => setDeleteProductId(product.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ),
                      },
                    ]}
                  />
                )}
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Orders</h2>
                {!adminOrders ? (
                  <TableSkeleton />
                ) : adminOrders.items.length === 0 ? (
                  <div className="card-surface">
                    <EmptyState
                      icon={<Inbox size={22} />}
                      title="No orders yet"
                      description="Orders placed by customers will appear here."
                    />
                  </div>
                ) : (
                  <AdminTable
                    rows={adminOrders.items}
                    columns={[
                      {
                        key: "order",
                        header: "Order",
                        render: (order: any) => (
                          <>
                            <div className="font-medium text-gray-800">
                              #{order.orderNumber}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </>
                        ),
                      },
                      {
                        key: "customer",
                        header: "Customer",
                        headerClassName: "hidden sm:table-cell",
                        className: "text-gray-600 hidden sm:table-cell",
                        render: (order: any) =>
                          order.userId ? `User #${order.userId}` : "Guest",
                      },
                      {
                        key: "total",
                        header: "Total",
                        className: "font-semibold text-navy",
                        render: (order: any) =>
                          formatPrice(Number(order.total)),
                      },
                      {
                        key: "status",
                        header: "Status",
                        render: (order: any) => (
                          <Select
                            value={order.status}
                            onValueChange={value =>
                              updateOrderStatus.mutate({
                                orderId: order.id,
                                status: value as any,
                              })
                            }
                          >
                            <SelectTrigger
                              aria-label={`Update status for order ${order.orderNumber}`}
                              className="h-8 w-[130px] text-xs"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map(s => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="capitalize"
                                >
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ),
                      },
                      {
                        key: "actions",
                        header: "Actions",
                        headerClassName: "text-right",
                        className: "text-right",
                        render: (order: any) => (
                          <button
                            type="button"
                            className="text-xs text-navy font-medium hover:underline"
                            onClick={() => setOrderDetailId(order.id)}
                          >
                            View
                          </button>
                        ),
                      },
                    ]}
                  />
                )}
              </motion.div>
            )}

            {/* Customers Tab */}
            {activeTab === "customers" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Customers
                </h2>
                {!adminCustomers ? (
                  <TableSkeleton />
                ) : adminCustomers.items.length === 0 ? (
                  <div className="card-surface">
                    <EmptyState
                      icon={<UserX size={22} />}
                      title="No customers yet"
                      description="Registered customers will show up here."
                    />
                  </div>
                ) : (
                  <AdminTable
                    rows={adminCustomers.items}
                    columns={[
                      {
                        key: "customer",
                        header: "Customer",
                        render: (customer: any) => (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-navy/10 text-navy flex items-center justify-center text-xs font-bold">
                              {customer.name?.charAt(0) || "?"}
                            </div>
                            <span className="font-medium text-gray-800">
                              {customer.name || "Anonymous"}
                            </span>
                          </div>
                        ),
                      },
                      {
                        key: "email",
                        header: "Email",
                        headerClassName: "hidden sm:table-cell",
                        className: "text-gray-700 font-medium hidden sm:table-cell",
                        render: (customer: any) => customer.email || "—",
                      },
                      {
                        key: "role",
                        header: "Role",
                        render: (customer: any) => (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${customer.role === "admin" ? "bg-navy/10 text-navy" : "bg-gray-100 text-gray-600"}`}
                          >
                            {customer.role}
                          </span>
                        ),
                      },
                      {
                        key: "joined",
                        header: "Joined",
                        headerClassName: "hidden md:table-cell",
                        className: "text-gray-600 font-medium text-xs hidden md:table-cell",
                        render: (customer: any) =>
                          new Date(customer.createdAt).toLocaleDateString(),
                      },
                    ]}
                  />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {productDialogId !== null && (
        <ProductFormDialog
          productId={productDialogId}
          onClose={() => setProductDialogId(null)}
          onSaved={() => {
            setProductDialogId(null);
            utils.admin.products.invalidate();
          }}
        />
      )}

      <AlertDialog
        open={deleteProductId !== null}
        onOpenChange={open => !open && setDeleteProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() =>
                deleteProductId !== null &&
                deleteProduct.mutate({ productId: deleteProductId })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {orderDetailId !== null && (
        <OrderDetailDialog
          orderId={orderDetailId}
          onClose={() => setOrderDetailId(null)}
        />
      )}
    </MainLayout>
  );
}

function ProductFormDialog({
  productId,
  onClose,
  onSaved,
}: {
  productId: number | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = productId === "new";
  const { data: existing } = trpc.admin.productById.useQuery(
    { productId: isNew ? -1 : productId },
    { enabled: !isNew }
  );
  const { data: brandOptions } = trpc.admin.brandOptions.useQuery();
  const { data: categoryOptions } = trpc.admin.categoryOptions.useQuery();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    brandId: "",
    categoryId: "",
    shortDescription: "",
    description: "",
    basePrice: "",
    salePrice: "",
    stockQuantity: "0",
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    isActive: true,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        sku: existing.sku,
        brandId: String(existing.brandId),
        categoryId: String(existing.categoryId),
        shortDescription: existing.shortDescription ?? "",
        description: existing.description ?? "",
        basePrice: String(existing.basePrice),
        salePrice: existing.salePrice != null ? String(existing.salePrice) : "",
        stockQuantity: String(existing.stockQuantity),
        isFeatured: existing.isFeatured,
        isBestSeller: existing.isBestSeller,
        isNew: existing.isNew,
        isActive: existing.isActive,
      });
    }
  }, [existing]);

  const createProduct = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      toast.success("Product created");
      onSaved();
    },
    onError: err => toast.error(err.message),
  });
  const updateProduct = trpc.admin.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Product updated");
      onSaved();
    },
    onError: err => toast.error(err.message),
  });

  const pending = createProduct.isPending || updateProduct.isPending;

  function handleSubmit() {
    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !form.brandId ||
      !form.categoryId ||
      !form.basePrice
    ) {
      toast.error("Name, SKU, brand, category and price are required");
      return;
    }
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
      shortDescription: form.shortDescription || undefined,
      description: form.description || undefined,
      basePrice: Number(form.basePrice),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      stockQuantity: Number(form.stockQuantity) || 0,
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
      isNew: form.isNew,
      isActive: form.isActive,
    };
    if (isNew) {
      createProduct.mutate(payload);
    } else {
      updateProduct.mutate({ productId: productId as number, ...payload });
    }
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add Product" : "Edit Product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Basic info */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-medium">
              Basic Information
            </div>
            <div>
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="p-sku">SKU</Label>
              <Input
                id="p-sku"
                value={form.sku}
                onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="p-brand">Brand</Label>
                <Select
                  value={form.brandId}
                  onValueChange={v => setForm(f => ({ ...f, brandId: v }))}
                >
                  <SelectTrigger id="p-brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {(brandOptions ?? []).map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-category">Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger id="p-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categoryOptions ?? []).map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Pricing & stock */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-medium">
              Pricing &amp; Stock
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="p-price">Base Price</Label>
                <Input
                  id="p-price"
                  type="number"
                  value={form.basePrice}
                  onChange={e =>
                    setForm(f => ({ ...f, basePrice: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="p-sale">Sale Price</Label>
                <Input
                  id="p-sale"
                  type="number"
                  value={form.salePrice}
                  onChange={e =>
                    setForm(f => ({ ...f, salePrice: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="p-stock">Stock Qty</Label>
                <Input
                  id="p-stock"
                  type="number"
                  value={form.stockQuantity}
                  onChange={e =>
                    setForm(f => ({ ...f, stockQuantity: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Description */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-medium">
              Description
            </div>
            <div>
              <Label htmlFor="p-short">Short Description</Label>
              <Input
                id="p-short"
                value={form.shortDescription}
                onChange={e =>
                  setForm(f => ({ ...f, shortDescription: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                value={form.description}
                onChange={e =>
                  setForm(f => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Flags */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-medium">
              Visibility
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <label
                htmlFor="p-featured"
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <Switch
                  id="p-featured"
                  checked={form.isFeatured}
                  onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))}
                />
                Featured
              </label>
              <label
                htmlFor="p-bestseller"
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <Switch
                  id="p-bestseller"
                  checked={form.isBestSeller}
                  onCheckedChange={v =>
                    setForm(f => ({ ...f, isBestSeller: v }))
                  }
                />
                Best Seller
              </label>
              <label
                htmlFor="p-active"
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <Switch
                  id="p-active"
                  checked={form.isActive}
                  onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                />
                Active
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-navy text-white"
            disabled={pending}
            onClick={handleSubmit}
          >
            {isNew ? "Create Product" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrderDetailDialog({
  orderId,
  onClose,
}: {
  orderId: number;
  onClose: () => void;
}) {
  const { data: order, isLoading } = trpc.admin.orderById.useQuery({ orderId });

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {order ? `Order #${order.orderNumber}` : "Order Detail"}
          </DialogTitle>
        </DialogHeader>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        )}
        {!isLoading && !order && (
          <p className="text-sm text-gray-700 font-medium">Order not found.</p>
        )}
        {order && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600 font-medium uppercase">Customer</div>
                <div className="font-medium text-gray-800">
                  {order.customer?.name || "Guest"}
                </div>
                <div className="text-gray-700 font-medium">
                  {order.customer?.email || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium uppercase">Status</div>
                <div className="font-medium text-gray-800 capitalize">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusBadgeClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="text-gray-700 font-medium mt-1">
                  Payment: {order.paymentStatus}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="text-xs text-gray-600 font-medium uppercase mb-2">Items</div>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0"
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {item.productName}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {item.variantName ? `${item.variantName} · ` : ""}Qty{" "}
                        {item.quantity}
                      </div>
                    </div>
                    <div className="font-semibold text-navy">
                      {formatPrice(Number(item.subtotal))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1">
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Shipping</span>
                <span>{formatPrice(Number(order.shippingFee))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-navy text-base border-t border-gray-100 pt-2 mt-1">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
