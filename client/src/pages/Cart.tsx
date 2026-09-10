import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Truck,
  Lock,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice, getProductImage } from "@/lib/data";

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, total, itemCount, updateItem, removeItem, isLoading } =
    useCart();

  if (!isLoading && items.length === 0) {
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-[70vh] flex flex-col items-center justify-center py-24 bg-white"
        >
          <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6">
            <ShoppingCart
              size={40}
              className="text-gray-200"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 text-sm mb-8 text-center max-w-xs">
            Looks like you haven't added anything yet. Explore our catalog and
            find something you'll love.
          </p>
          <Link href="/products">
            <Button className="bg-[#F85606] hover:bg-[#e04d00] text-white px-8 h-12 text-sm font-semibold flex items-center gap-2 rounded-xl shadow-md">
              <ShoppingBag size={18} /> Browse Products
            </Button>
          </Link>
        </motion.div>
      </MainLayout>
    );
  }

  const shippingFee = total > 10000 ? 0 : 500;
  const grandTotal = total + shippingFee;

  return (
    <MainLayout>
      {/* Page Hero */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-px bg-[#C9A84C]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                Review & Checkout
              </span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900 font-display">
                Shopping Cart
              </h1>
              <span className="bg-[#0F2D5E] text-white text-sm font-bold rounded-full px-3 py-1">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-white py-10">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        x: -24,
                        height: 0,
                        marginTop: 0,
                        marginBottom: 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="p-5 flex gap-4"
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="flex-shrink-0"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
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
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-[#C9A84C] mb-0.5 uppercase tracking-wide">
                              {item.brandName}
                            </div>
                            <Link
                              href={`/products/${item.productSlug}`}
                              className="text-sm font-semibold text-gray-900 hover:text-[#0F2D5E] line-clamp-2 transition-colors"
                            >
                              {item.productName}
                            </Link>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label="Remove item"
                            className="flex-shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-auto pt-3 flex items-end justify-between gap-3">
                          <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                            <button
                              onClick={() =>
                                updateItem(item.id, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#0F2D5E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold text-gray-900 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateItem(item.id, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#0F2D5E] transition-colors"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-bold text-[#F85606]">
                              {formatPrice(
                                Number(item.unitPrice) * item.quantity
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              {formatPrice(Number(item.unitPrice))} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Link
                  href="/products"
                  className="text-sm text-[#0F2D5E] font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:sticky lg:top-24"
              >
                <h2 className="font-bold text-gray-900 text-lg mb-5 font-display">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm text-slate-900">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>
                      Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Shipping</span>
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
                  {shippingFee === 0 && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-1.5 font-semibold">
                      <Truck size={13} /> Free island-wide delivery applied
                    </div>
                  )}
                  {shippingFee > 0 && (
                    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-semibold">
                      Add {formatPrice(10000 - total)} more for free shipping
                    </div>
                  )}
                  <Separator className="bg-slate-200" />
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="font-extrabold text-slate-900 text-base">
                      Total
                    </span>
                    <span className="text-[#0F2D5E] font-black text-2xl">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full mt-5 bg-[#F85606] hover:bg-[#e04d00] text-white h-12 font-bold flex items-center justify-center gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </Button>

                <Link
                  href="/products"
                  className="block text-center text-sm text-slate-700 font-semibold hover:text-[#0F2D5E] transition-colors mt-3"
                >
                  Continue Shopping
                </Link>

                <div className="mt-5 pt-5 border-t border-slate-200 space-y-2.5 text-slate-700">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                    <Lock size={14} className="text-[#0F2D5E]" />
                    <span>Secure SSL checkout</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                    <Truck size={14} className="text-[#0F2D5E]" />
                    <span>Island-wide delivery — all 25 districts</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                    <ShieldCheck size={14} className="text-[#0F2D5E]" />
                    <span>Genuine warranty on all products</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
