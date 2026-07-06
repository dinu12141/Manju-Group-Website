import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  Shield,
  Truck,
  ImageOff,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import MainLayout from "@/components/MainLayout";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/data";

function CartImagePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300">
      <ImageOff size={22} strokeWidth={1.5} />
    </div>
  );
}

export default function Cart() {
  const { items, total, itemCount, updateItem, removeItem, isLoading } =
    useCart();

  if (!isLoading && items.length === 0) {
    return (
      <MainLayout>
        <div className="container py-16">
          <EmptyState
            icon={<ShoppingCart size={28} strokeWidth={1.5} />}
            title="Your cart is empty"
            description="Looks like you haven't added anything yet. Explore our catalog and find something you'll love."
            action={
              <Link href="/products">
                <Button className="bg-navy hover:bg-navy-light text-white px-8 h-12 text-sm font-semibold flex items-center gap-2">
                  <ShoppingBag size={18} /> Continue Shopping
                </Button>
              </Link>
            }
          />
        </div>
      </MainLayout>
    );
  }

  const shippingFee = total > 10000 ? 0 : 500;
  const grandTotal = total + shippingFee;

  return (
    <MainLayout>
      <div className="bg-gray-50 border-b border-gray-100 py-6">
        <div className="container">
          <h1 className="text-2xl font-bold text-gray-800 font-display">
            Shopping Cart
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card-surface divide-y divide-gray-100 overflow-hidden">
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
                    className="p-4 sm:p-5 flex gap-4"
                  >
                    {/* Image */}
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName || ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CartImagePlaceholder />
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-400 mb-0.5">
                            {item.brandName}
                          </div>
                          <Link
                            href={`/products/${item.productSlug}`}
                            className="text-sm font-semibold text-gray-800 hover:text-navy line-clamp-2"
                          >
                            {item.productName}
                          </Link>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          className="flex-shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-auto pt-3 flex items-end justify-between gap-3">
                        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden shadow-xs">
                          <button
                            onClick={() =>
                              updateItem(item.id, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold text-gray-800 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItem(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-navy transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-navy">
                            {formatPrice(
                              Number(item.unitPrice) * item.quantity
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
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
                className="text-sm text-navy font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card-surface p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-bold text-gray-800 text-lg mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                  </span>
                  <span className="font-medium text-gray-700">
                    {formatPrice(total)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span
                    className={
                      shippingFee === 0
                        ? "text-green font-semibold"
                        : "font-medium text-gray-700"
                    }
                  >
                    {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <div className="text-xs text-amber-700 bg-amber/10 rounded-md px-2.5 py-2">
                    Add {formatPrice(10000 - total)} more for free shipping
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-navy font-extrabold text-xl">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full mt-5 bg-navy hover:bg-navy-light text-white h-12 font-semibold flex items-center gap-2 shadow-card hover:shadow-card-hover transition-shadow">
                  Proceed to Checkout <ArrowRight size={16} />
                </Button>
              </Link>

              <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={13} className="text-green" /> Secure checkout
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck size={13} className="text-green" /> Island-wide
                  delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
