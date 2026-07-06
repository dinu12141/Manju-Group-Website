import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { formatPrice, getDiscountPercent } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: number;
  slug: string;
  name: string;
  brandName?: string | null;
  basePrice: string | number;
  salePrice?: string | number | null;
  currency?: string;
  imageUrl?: string | null;
  isInStock?: boolean | null;
  isBestSeller?: boolean | null;
  isNew?: boolean | null;
  isFeatured?: boolean | null;
  variant?: "grid" | "list";
}

export default function ProductCard({
  id, slug, name, brandName, basePrice, salePrice, currency = "LKR",
  imageUrl, isInStock, isBestSeller, isNew, isFeatured, variant = "grid",
}: ProductCardProps) {
  const { addItem } = useCart();
  const hasDiscount = salePrice && Number(salePrice) < Number(basePrice);
  const displayPrice = hasDiscount ? salePrice! : basePrice;
  const discount = hasDiscount ? getDiscountPercent(basePrice, salePrice!) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(id, Number(displayPrice), name);
  };

  if (variant === "list") {
    return (
      <Link href={`/products/${slug}`}>
        <motion.div
          whileHover={{ y: -1 }}
          className="product-card flex gap-4 p-4 cursor-pointer"
        >
          <div className="w-28 h-28 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📦</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-1">{brandName}</div>
            <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm mb-2">{name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-navy">{formatPrice(displayPrice, currency)}</span>
              {hasDiscount && (
                <>
                  <span className="text-xs text-gray-400 line-through">{formatPrice(basePrice, currency)}</span>
                  <span className="badge-offer">{discount}% OFF</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${isInStock ? "text-green" : "text-red-500"}`}>
                {isInStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className="self-center flex-shrink-0 w-9 h-9 rounded-lg bg-navy text-white flex items-center justify-center hover:bg-navy-light transition-colors disabled:opacity-40"
          >
            <ShoppingCart size={16} />
          </button>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${slug}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="product-card group cursor-pointer h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-product bg-gray-50 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200 text-5xl">📦</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && <span className="badge-offer">{discount}% OFF</span>}
            {isNew && <span className="badge-new">NEW</span>}
            {isBestSeller && !hasDiscount && !isNew && (
              <span className="bg-amber text-gray-900 text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase">Best Seller</span>
            )}
          </div>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className="w-full py-2 rounded-lg bg-navy text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-navy-light transition-colors disabled:opacity-50 shadow-lg"
            >
              <ShoppingCart size={14} />
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <div className="text-xs text-gray-400 mb-1">{brandName}</div>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 flex-1">{name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-navy text-sm">{formatPrice(displayPrice, currency)}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(basePrice, currency)}</span>
            )}
          </div>
          <div className="mt-1.5">
            <span className={`text-xs ${isInStock ? "text-green" : "text-red-400"}`}>
              {isInStock ? "● In Stock" : "● Out of Stock"}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
