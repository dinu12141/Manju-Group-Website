import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingCart,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Lock,
  Truck,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/data";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=75";

const FALLBACK_MAP: Record<string, string> = {
  bike: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=75",
  scooter:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=75",
  electric:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=75",
  tv: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=75",
  "smart tv":
    "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=75",
  ac: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=75",
  air: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=75",
  water:
    "https://images.unsplash.com/photo-1548186277-8eb4d5e2fc0f?auto=format&fit=crop&w=400&q=75",
  filter:
    "https://images.unsplash.com/photo-1548186277-8eb4d5e2fc0f?auto=format&fit=crop&w=400&q=75",
};

function getProductImage(
  imageUrl: string | null | undefined,
  name: string | null | undefined
): string {
  if (imageUrl) return imageUrl;
  const lower = (name || "").toLowerCase();
  for (const [kw, url] of Object.entries(FALLBACK_MAP)) {
    if (lower.includes(kw)) return url;
  }
  return FALLBACK_IMAGE;
}

const FREE_SHIPPING_THRESHOLD = 10000;
const SHIPPING_FEE = 500;

export interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const [, navigate] = useLocation();
  const { items, total, itemCount, isLoading, updateItem, removeItem } =
    useCart();

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus management: save trigger, focus close button on open, restore on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      if (triggerRef.current && "focus" in triggerRef.current) {
        (triggerRef.current as HTMLElement).focus();
      }
    }
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const trapTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", trapTab);
    return () => document.removeEventListener("keydown", trapTab);
  }, [open]);

  const shippingFee = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = total + shippingFee;
  const progressPct = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFree = FREE_SHIPPING_THRESHOLD - total;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black z-[60]"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-[400px] max-w-[100vw] bg-white z-[61] flex flex-col shadow-2xl"
          >
            {/* ── Header ────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingCart
                  size={20}
                  className="text-[#0F2D5E]"
                  strokeWidth={2}
                />
                <h2 className="font-bold text-gray-900 font-display text-lg leading-none">
                  Shopping Cart
                </h2>
                {itemCount > 0 && (
                  <span className="bg-[#0F2D5E] text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 leading-none">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400">
                  <Lock size={10} className="text-[#0F2D5E]" />
                  Secure checkout
                </span>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  aria-label="Close cart"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#F85606] outline-none"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── Item list ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <div className="divide-y divide-gray-50">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="p-4 flex gap-3">
                      <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <Skeleton className="h-2.5 w-16" />
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-7 w-20 mt-2 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5">
                    <ShoppingCart
                      size={36}
                      className="text-gray-200"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-display mb-1">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-[220px]">
                    Start exploring our catalog and find something you'll love.
                  </p>
                  <Button
                    onClick={() => {
                      navigate("/products");
                      onClose();
                    }}
                    className="bg-[#F85606] hover:bg-[#e04d00] text-white px-6 h-11 text-sm font-semibold flex items-center gap-2 rounded-xl focus-visible:ring-2 focus-visible:ring-[#F85606] outline-none"
                  >
                    <ShoppingBag size={16} /> Browse Products
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          x: -20,
                          height: 0,
                          marginTop: 0,
                          marginBottom: 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="p-4 flex gap-3"
                      >
                        {/* Image */}
                        <Link
                          href={`/products/${item.productSlug}`}
                          onClick={onClose}
                          className="flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[#F85606] rounded-xl outline-none"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                            <img
                              src={getProductImage(
                                item.imageUrl,
                                item.productName
                              )}
                              alt={item.productName ?? "Product"}
                              className="w-full h-full object-cover"
                              onError={e => {
                                (e.target as HTMLImageElement).src =
                                  FALLBACK_IMAGE;
                              }}
                            />
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              {item.brandName && (
                                <div className="text-[10px] font-semibold text-[#C9A84C] uppercase tracking-wide mb-0.5">
                                  {item.brandName}
                                </div>
                              )}
                              <Link
                                href={`/products/${item.productSlug}`}
                                onClick={onClose}
                                className="text-sm font-semibold text-gray-900 hover:text-[#0F2D5E] line-clamp-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#F85606] outline-none"
                              >
                                {item.productName}
                              </Link>
                              <div className="text-xs text-gray-400 mt-0.5">
                                {formatPrice(Number(item.unitPrice))} each
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.productName ?? "item"}`}
                              className="flex-shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors p-1 rounded-lg focus-visible:ring-2 focus-visible:ring-[#F85606] outline-none"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Qty stepper + line total */}
                          <div className="flex items-center justify-between mt-auto pt-2">
                            <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                              <button
                                onClick={() =>
                                  updateItem(item.id, item.quantity - 1)
                                }
                                aria-label="Decrease quantity"
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#0F2D5E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F85606] outline-none"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-gray-900 tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateItem(item.id, item.quantity + 1)
                                }
                                aria-label="Increase quantity"
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#0F2D5E] transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F85606] outline-none"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                            <div className="text-sm font-bold text-[#F85606]">
                              {formatPrice(
                                Number(item.unitPrice) * item.quantity
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── Footer (only when items present) ─────────────── */}
            {!isLoading && items.length > 0 && (
              <div className="border-t border-gray-100 bg-white shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.06)] px-5 py-4 space-y-3 flex-shrink-0">
                {/* Free shipping progress / banner */}
                {total < FREE_SHIPPING_THRESHOLD ? (
                  <div className="space-y-1.5">
                    <p className="text-xs text-amber-700">
                      Add{" "}
                      <span className="font-semibold">
                        {formatPrice(amountToFree)}
                      </span>{" "}
                      more for FREE shipping
                    </p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#F85606] rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                    <Truck size={12} /> Free island-wide delivery applied
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between text-sm text-slate-900">
                  <span className="text-slate-700 font-medium">
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-sm text-slate-900">
                  <span className="text-slate-700 font-medium">Shipping</span>
                  <span
                    className={
                      shippingFee === 0
                        ? "text-emerald-700 font-bold"
                        : "font-bold text-slate-900"
                    }
                  >
                    {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                  </span>
                </div>

                {/* Grand total */}
                <div className="flex justify-between items-baseline border-t border-slate-200 pt-2 text-slate-900">
                  <span className="font-extrabold text-slate-900">Total</span>
                  <span className="text-[#0F2D5E] font-black text-xl">
                    {formatPrice(grandTotal)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <Button
                  className="w-full bg-[#F85606] hover:bg-[#e04d00] text-white h-11 font-semibold flex items-center justify-center gap-2 rounded-xl shadow-md hover:shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-[#F85606] outline-none"
                  onClick={() => {
                    navigate("/checkout");
                    onClose();
                  }}
                >
                  Proceed to Checkout <ArrowRight size={15} />
                </Button>

                {/* Continue shopping */}
                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-gray-400 hover:text-[#0F2D5E] transition-colors py-1 focus-visible:ring-2 focus-visible:ring-[#F85606] outline-none rounded"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
