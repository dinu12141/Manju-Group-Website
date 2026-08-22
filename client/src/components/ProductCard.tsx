import { useState, useCallback } from "react";
import { Link } from "wouter";
import {
  ShoppingCart,
  Heart,
  Check,
  Loader2,
  Star,
  PackageX,
  ShieldCheck,
} from "lucide-react";
import { formatPrice, getDiscountPercent, cleanText } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

const FALLBACK_DEFAULT = "/scooter_red.png";

function getProductImage(
  imageUrl: string | null | undefined,
  name: string
): string {
  if (imageUrl && !imageUrl.includes("manjugroup.lk")) {
    return imageUrl;
  }
  const nameLower = name.toLowerCase();
  if (nameLower.includes("32") && (nameLower.includes("tv") || nameLower.includes("smart"))) {
    return "/dew_plus_32_tv.png";
  }
  if (nameLower.includes("43") && (nameLower.includes("tv") || nameLower.includes("smart"))) {
    return "/dew_plus_43_tv.png";
  }
  if (nameLower.includes("55") || nameLower.includes("65") || (nameLower.includes("tv") || nameLower.includes("smart"))) {
    return "/dew_plus_55_tv.png";
  }
  if (nameLower.includes("1.5") || (nameLower.includes("1_5") && (nameLower.includes("ac") || nameLower.includes("air")))) {
    return "/dew_plus_ac_1_5ton.png";
  }
  if (nameLower.includes("2") && (nameLower.includes("ac") || nameLower.includes("air"))) {
    return "/dew_plus_ac_2ton.png";
  }
  if (nameLower.includes("ac") || nameLower.includes("air conditioner") || nameLower.includes("inverter")) {
    return "/dew_plus_ac_1ton.png";
  }
  if (nameLower.includes("water") || nameLower.includes("filter") || nameLower.includes("purifier") || nameLower.includes("dispenser") || nameLower.includes("ro")) {
    return "/ro_water_purifier.png";
  }
  if (nameLower.includes("scooter") || nameLower.includes("em003") || nameLower.includes("silver") || nameLower.includes("yw06")) {
    return "/scooter_silver.png";
  }
  if (nameLower.includes("bike") || nameLower.includes("motor") || nameLower.includes("electric") || nameLower.includes("em005")) {
    return "/scooter_red.png";
  }
  if (
    nameLower.includes("book") ||
    nameLower.includes("ruled") ||
    nameLower.includes("drawing") ||
    nameLower.includes("exercise") ||
    nameLower.includes("cr") ||
    nameLower.includes("a4") ||
    nameLower.includes("a5") ||
    nameLower.includes("b5") ||
    nameLower.includes("stationery")
  ) {
    return "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80";
  }
  return FALLBACK_DEFAULT;
}

function Stars({
  rating = 4.8,
  count = 128,
}: {
  rating?: number;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={10}
            className={
              i <= Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : i - 0.5 <= rating
                  ? "fill-amber-300 text-amber-300"
                  : "fill-gray-200 text-gray-200"
            }
          />
        ))}
      </div>
      <span className="text-[10px] font-bold text-gray-700 ml-0.5">
        {rating.toFixed(1)}
      </span>
      <span className="text-[10px] text-gray-400">({count})</span>
    </div>
  );
}

type CartState = "idle" | "loading" | "success" | "error";

export interface ProductCardProps {
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
  warrantyMonths?: number | null;
  variant?: "grid" | "list" | "compact";
  onWishlistToggle?: (id: number, wishlisted: boolean) => void;
  isWishlisted?: boolean;
  priority?: boolean;
}

export default function ProductCard({
  id,
  slug,
  name,
  brandName,
  basePrice,
  salePrice,
  currency = "LKR",
  imageUrl,
  isInStock = true,
  isBestSeller,
  isNew,
  isFeatured,
  warrantyMonths,
  variant = "grid",
  onWishlistToggle,
  isWishlisted = false,
  priority = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted: checkWishlisted, toggleWishlist } = useWishlist();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => getProductImage(imageUrl, name));
  const [cartState, setCartState] = useState<CartState>("idle");

  const wishlisted = checkWishlisted(id);
  const cleanName = cleanText(name);
  const cleanBrand = cleanText(brandName);

  const hasDiscount =
    salePrice != null && Number(salePrice) > 0 && Number(salePrice) < Number(basePrice);
  const displayPrice = hasDiscount ? salePrice! : basePrice;
  const discount = hasDiscount ? getDiscountPercent(basePrice, salePrice!) : 0;

  const rating = 4.5 + ((id * 7) % 5) / 10;
  const soldCount = 45 + ((id * 37) % 350);

  const handleWishlist = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      await toggleWishlist(id, cleanName);
      onWishlistToggle?.(id, !wishlisted);
    },
    [toggleWishlist, id, cleanName, onWishlistToggle, wishlisted]
  );

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (cartState !== "idle" || isInStock === false) return;
      setCartState("loading");
      try {
        await addItem(id, Number(displayPrice), cleanName);
        setCartState("success");
      } catch {
        setCartState("error");
      } finally {
        setTimeout(() => setCartState("idle"), 1500);
      }
    },
    [cartState, isInStock, addItem, id, displayPrice, cleanName]
  );

  // Badges
  const badges = [
    hasDiscount && {
      label: `-${discount}%`,
      cls: "bg-[#F85606] text-white font-bold",
    },
    isNew && { label: "NEW", cls: "bg-emerald-600 text-white font-bold" },
    isBestSeller && { label: "HOT", cls: "bg-amber-400 text-gray-900 font-bold" },
  ].filter(Boolean) as Array<{ label: string; cls: string }>;

  function cartContent() {
    if (isInStock === false)
      return { icon: <PackageX size={13} />, text: "Out of Stock" };
    if (cartState === "loading")
      return {
        icon: <Loader2 size={13} className="animate-spin" />,
        text: "Adding",
      };
    if (cartState === "success")
      return { icon: <Check size={13} />, text: "Added" };
    return { icon: <ShoppingCart size={13} />, text: "Add to Cart" };
  }

  const { icon: cartIcon, text: cartText } = cartContent();

  const cartBtnCls = [
    "w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F85606]",
    isInStock === false
      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
      : cartState === "success"
        ? "bg-green-600 text-white shadow-xs"
        : "bg-[#0F2D5E] text-white hover:bg-[#1a4a8a] active:scale-[0.98]",
  ].join(" ");

  // ── List View ─────────────────────────────────────────────────────────────
  if (variant === "list") {
    return (
      <Link
        href={`/products/${slug}`}
        className="block focus-visible:outline-none rounded-xl group"
      >
        <div className="flex flex-col sm:flex-row gap-4 p-3 bg-white border border-gray-200 rounded-xl shadow-xs hover:shadow-md hover:border-[#0F2D5E]/30 transition-all duration-200 cursor-pointer">
          <div className="w-full sm:w-36 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 relative flex items-center justify-center p-2 border border-gray-100">
            <img
              src={imgSrc}
              alt={cleanName}
              loading={priority ? "eager" : "lazy"}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgSrc(FALLBACK_DEFAULT)}
            />
            {badges.length > 0 && (
              <span
                className={`absolute top-2 left-2 ${badges[0].cls} text-[9px] px-1.5 py-0.5 rounded shadow-xs`}
              >
                {badges[0].label}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              {cleanBrand && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-bold text-[#0F2D5E] uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">
                    {cleanBrand}
                  </span>
                  {warrantyMonths ? (
                    <span className="text-[9px] text-gray-500 flex items-center gap-0.5">
                      <ShieldCheck size={10} className="text-emerald-600" />
                      {warrantyMonths >= 12 ? `${Math.floor(warrantyMonths / 12)}Y` : `${warrantyMonths}M`} Warranty
                    </span>
                  ) : null}
                </div>
              )}
              <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-1 leading-snug group-hover:text-[#0F2D5E] transition-colors">
                {cleanName}
              </h3>
              <Stars rating={rating} count={soldCount} />
            </div>

            <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-gray-100 flex-wrap">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-[#F85606] text-base font-display">
                    {formatPrice(displayPrice, currency)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] text-gray-400 line-through">
                      {formatPrice(basePrice, currency)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleWishlist}
                  aria-label="Add to wishlist"
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart
                    size={14}
                    className={wishlisted ? "fill-red-500 text-red-500" : ""}
                  />
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isInStock === false || cartState === "loading"}
                  className="px-3.5 py-1.5 rounded-lg font-semibold text-xs text-white bg-[#0F2D5E] hover:bg-[#1a4a8a] transition-all flex items-center gap-1.5"
                >
                  {cartIcon}
                  {cartText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── Grid View (Daraz Style Compact Card) ──────────────────────────────────
  return (
    <Link
      href={`/products/${slug}`}
      className="block h-full focus-visible:outline-none rounded-xl group"
    >
      <div className="bg-white rounded-xl border border-gray-200/90 hover:border-[#0F2D5E]/40 hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col overflow-hidden relative">
        {/* Image Container (Square / Compact Daraz Style) */}
        <div className="relative aspect-square bg-gray-50/70 p-2.5 flex items-center justify-center overflow-hidden border-b border-gray-100">
          <img
            src={imgSrc}
            alt={cleanName}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-105"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgSrc(FALLBACK_DEFAULT)}
          />

          {/* Top Left Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {badges.map(badge => (
              <span
                key={badge.label}
                className={`${badge.cls} text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-tight`}
              >
                {badge.label}
              </span>
            ))}
          </div>

          {/* Top Right Wishlist */}
          <button
            type="button"
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:bg-white text-gray-400 hover:text-red-500 z-10 transition-colors"
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={12}
              className={
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "transition-colors"
              }
            />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-3 flex flex-col flex-1 justify-between gap-2">
          <div>
            {/* Brand + Warranty */}
            <div className="flex items-center justify-between gap-1 mb-1">
              {cleanBrand ? (
                <span className="text-[9px] font-bold text-[#0F2D5E] uppercase tracking-wider bg-blue-50 px-1.5 py-0.2 rounded truncate">
                  {cleanBrand}
                </span>
              ) : <span />}

              {warrantyMonths ? (
                <span className="text-[9px] text-gray-500 font-medium flex items-center gap-0.5 flex-shrink-0">
                  <ShieldCheck size={10} className="text-emerald-600" />
                  {warrantyMonths >= 12 ? `${Math.floor(warrantyMonths / 12)}Y` : `${warrantyMonths}M`}
                </span>
              ) : null}
            </div>

            {/* Product Title (Fixed 2-line height for clean grid alignment) */}
            <h3 className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug h-8 group-hover:text-[#0F2D5E] transition-colors">
              {cleanName}
            </h3>

            {/* Stars */}
            <div className="mt-1">
              <Stars rating={rating} count={soldCount} />
            </div>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="pt-2 border-t border-gray-100/80 flex flex-col gap-1.5 mt-auto">
            <div className="flex items-baseline justify-between gap-1">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold text-[#F85606] font-display">
                  {formatPrice(displayPrice, currency)}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] text-gray-400 line-through">
                    {formatPrice(basePrice, currency)}
                  </span>
                )}
              </div>

              {hasDiscount && (
                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1 py-0.2 rounded border border-orange-100">
                  Save {discount}%
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isInStock === false || cartState === "loading"}
              aria-label={cartText}
              className={cartBtnCls}
            >
              {cartIcon}
              {cartText}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
