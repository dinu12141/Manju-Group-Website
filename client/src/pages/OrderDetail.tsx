import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  FileText,
  Building2,
  MessageSquare,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, getProductImage } from "@/lib/data";
import EmptyState from "@/components/EmptyState";
import { useSiteBankDetails, useSiteContacts } from "@/lib/siteSettings";

interface OrderDetailProps {
  params: { id: string };
}

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: <Clock size={16} /> },
  { key: "confirmed", label: "Confirmed", icon: <CheckCircle size={16} /> },
  { key: "processing", label: "Processing", icon: <Package size={16} /> },
  { key: "shipped", label: "Shipped", icon: <Truck size={16} /> },
  { key: "delivered", label: "Delivered", icon: <CheckCircle size={16} /> },
];

function getStepIndex(status: string) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function OrderDetail({ params }: OrderDetailProps) {
  const [, navigate] = useLocation();
  const orderId = Number(params.id);
  const { bankDetails } = useSiteBankDetails();
  const { contacts } = useSiteContacts();
  const cleanWhatsApp = contacts.whatsappNumber.replace(/[^0-9]/g, "");

  const {
    data: order,
    isLoading,
    error,
  } = trpc.orders.byId.useQuery({ id: orderId }, { enabled: !isNaN(orderId) });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-10 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </MainLayout>
    );
  }

  if (error || !order || isNaN(orderId)) {
    return (
      <MainLayout>
        <div className="container py-16">
          <EmptyState
            icon={<Package size={28} />}
            title="Order not found"
            description="We couldn't find this order, or it doesn't belong to your account."
            action={
              <Link href="/my-orders">
                <Button
                  style={{ backgroundColor: "#0F2D5E" }}
                  className="text-white"
                >
                  Back to My Orders
                </Button>
              </Link>
            }
            className="bg-white border border-gray-100 rounded-2xl"
          />
        </div>
      </MainLayout>
    );
  }

  const isCancelled =
    order.status === "cancelled" || order.status === "refunded";
  const stepIndex = getStepIndex(order.status);
  const shippingAddress = (order.shippingAddress || {}) as Record<string, any>;
  const total = Number((order as any).totalAmount ?? order.total);

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <button
          onClick={() => navigate("/my-orders")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2D5E] hover:underline"
        >
          <ArrowLeft size={16} /> Back to My Orders
        </button>

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-[#0a0a0a]">
                  Order #{order.orderNumber}
                </h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold capitalize ${
                    order.status === "delivered"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.status === "shipped"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : isCancelled
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-[#555555] font-medium mt-1">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[#F85606]">
                {formatPrice(total)}
              </div>
              <div className="text-xs text-[#555555] font-semibold uppercase mt-0.5">
                {order.paymentMethod === "bank"
                  ? "Bank Transfer"
                  : "Cash on Delivery"}
              </div>
            </div>
          </div>

          {/* Status timeline */}
          {!isCancelled && (
            <div className="mt-8 flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div
                  key={step.key}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                        i <= stepIndex
                          ? "bg-[#0F2D5E] border-[#0F2D5E] text-white"
                          : "bg-white border-slate-200 text-slate-300"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`text-[10px] font-bold text-center max-w-[70px] ${
                        i <= stepIndex ? "text-[#0F2D5E]" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-1 mb-5 ${
                        i < stepIndex ? "bg-[#0F2D5E]" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {isCancelled && (
            <div className="mt-6 flex items-center gap-2 text-red-600 font-bold text-sm">
              <XCircle size={18} />
              This order was {order.status}.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <h2 className="font-extrabold text-[#0a0a0a] text-base mb-4 flex items-center gap-2">
                <Package size={18} className="text-[#0F2D5E]" />
                Items ({order.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {(order.items || []).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                      <img
                        src={getProductImage(item.imageUrl, item.productName)}
                        alt={item.productName || ""}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            "/manju-logo-circle.webp";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0a0a0a] line-clamp-2">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-[#555555] mt-0.5">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-xs text-[#555555] font-medium mt-1">
                        Qty: {item.quantity} ×{" "}
                        {formatPrice(Number(item.unitPrice))}
                      </p>
                    </div>
                    <div className="text-sm font-black text-[#0a0a0a] flex-shrink-0">
                      {formatPrice(Number(item.unitPrice) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Summary sidebar */}
          <div className="space-y-6">
            {/* Shipping address */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-extrabold text-[#0a0a0a] text-base mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-[#0F2D5E]" />
                Shipping Address
              </h2>
              <div className="text-sm text-[#333333] space-y-1">
                <p className="font-bold text-[#0a0a0a]">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
                {shippingAddress.address && <p>{shippingAddress.address}</p>}
                <p>
                  {[shippingAddress.city, shippingAddress.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {shippingAddress.phone && (
                  <p>Mobile: {shippingAddress.phone}</p>
                )}
                {shippingAddress.email && <p>Email: {shippingAddress.email}</p>}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-extrabold text-[#0a0a0a] text-base mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-[#0F2D5E]" />
                Payment Summary
              </h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between text-[#444444]">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(Number(order.subtotal))}
                  </span>
                </div>
                <div className="flex justify-between text-[#444444]">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {Number(order.shippingFee) > 0
                      ? formatPrice(Number(order.shippingFee))
                      : "Free"}
                  </span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -{formatPrice(Number(order.discount))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#0a0a0a] pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                {(order.paymentMethod === "bank" ||
                  order.paymentMethod === "bank_transfer") && (
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-blue-50/80 rounded-xl p-3.5 text-xs text-blue-950 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#0F2D5E] font-bold">
                      <Building2 size={14} />
                      <span>Bank Transfer Details</span>
                    </div>
                    <p className="font-semibold text-slate-800">
                      {bankDetails.bankName} • {bankDetails.branch}
                    </p>
                    <p className="font-mono font-black text-blue-900 text-sm">
                      {bankDetails.accountNumber}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      A/C Name: <strong>{bankDetails.accountName}</strong>
                    </p>
                    <p className="text-[10px] text-blue-800/80 pt-1">
                      {bankDetails.instructions}
                    </p>
                    <a
                      href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                        `Hello Manju Group, here is the payment receipt for my Order ${order.orderNumber}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <MessageSquare size={12} />
                      <span>WhatsApp Payment Slip</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {order.notes && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-extrabold text-[#0a0a0a] text-base mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-[#0F2D5E]" />
                  Order Notes
                </h2>
                <p className="text-sm text-[#444444]">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
