import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/data";

export default function Cart() {
  const { items, total, itemCount, updateItem, removeItem, isLoading } = useCart();

  if (!isLoading && items.length === 0) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet. Start shopping!</p>
          <Link href="/products">
            <Button className="bg-navy text-white px-8 h-12 text-sm font-semibold flex items-center gap-2 mx-auto">
              <ShoppingBag size={18} /> Browse Products
            </Button>
          </Link>
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
          <h1 className="text-2xl font-bold text-gray-800 font-display">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-1">{itemCount} item{itemCount !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10, height: 0 }}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4"
                >
                  {/* Image */}
                  <Link href={`/products/${item.productSlug}`} className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName || ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 mb-0.5">{item.brandName}</div>
                    <Link href={`/products/${item.productSlug}`} className="text-sm font-semibold text-gray-800 hover:text-navy line-clamp-2">
                      {item.productName}
                    </Link>
                    <div className="text-sm font-bold text-navy mt-1">
                      {formatPrice(Number(item.unitPrice) * item.quantity)}
                    </div>
                    <div className="text-xs text-gray-400">{formatPrice(Number(item.unitPrice))} each</div>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-between items-center pt-2">
              <Link href="/products" className="text-sm text-navy font-medium flex items-center gap-1 hover:gap-2 transition-all">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
              <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? "text-green font-medium" : ""}>
                    {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <div className="text-xs text-gray-400">
                    Add {formatPrice(10000 - total)} more for free shipping
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-gray-800 text-base">
                  <span>Total</span>
                  <span className="text-navy">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full mt-5 bg-navy hover:bg-navy-light text-white h-12 font-semibold flex items-center gap-2">
                  Proceed to Checkout <ArrowRight size={16} />
                </Button>
              </Link>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={13} className="text-green" /> Secure checkout
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck size={13} className="text-green" /> Island-wide delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
