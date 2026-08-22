import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Shield,
  Truck,
  Star,
  ChevronLeft,
  ChevronRight,
  PackageX,
  RotateCcw,
  Zap,
  Minus,
  Plus,
  Lock,
  Check,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import MainLayout from "@/components/MainLayout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { STATIC_PRODUCTS } from "@/lib/staticData";

interface ProductDetailProps {
  params: { slug: string };
}

type NormalizedProduct = {
  id: number;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  brandName?: string | null;
  brandId: number;
  categoryId: number;
  basePrice: string | number;
  salePrice?: string | number | null;
  currency?: string | null;
  isInStock: boolean;
  specifications?: string | object | null;
  warrantyMonths?: number | null;
  images: { url: string }[];
  sku?: string | null;
};

const BRAND_FALLBACK_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  2: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80",
  3: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
  4: "https://images.unsplash.com/photo-1548186277-8eb4d5e2fc0f?auto=format&fit=crop&w=800&q=80",
  5: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={13}
            className={
              i <= Math.floor(rating)
                ? "fill-[#4ade80] text-[#4ade80]"
                : "fill-white/10 text-white/20"
            }
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-white/90">
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-white/50">({count} reviews)</span>
    </div>
  );
}

type TabKey = "description" | "specifications" | "reviews";

export default function ProductDetail({ params }: ProductDetailProps) {
  const { slug } = params;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const [descExpanded, setDescExpanded] = useState(false);

  const { data: dbProduct, isLoading } = trpc.products.bySlug.useQuery({ slug });
  const staticProduct = STATIC_PRODUCTS.find(p => p.slug === slug);

  const { data: relatedDb } = trpc.products.related.useQuery(
    {
      productId: dbProduct?.id ?? 0,
      brandId: dbProduct?.brandId ?? 0,
      categoryId: dbProduct?.categoryId ?? 0,
    },
    { enabled: !!dbProduct?.id }
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="aspect-[4/3] rounded-2xl bg-white/5" />
            <div className="space-y-4">
              <Skeleton className="h-5 w-1/3 bg-white/5" />
              <Skeleton className="h-9 w-full bg-white/5" />
              <Skeleton className="h-5 w-1/2 bg-white/5" />
              <Skeleton className="h-10 w-1/2 bg-white/5" />
              <Skeleton className="h-px w-full bg-white/10" />
              <Skeleton className="h-16 w-full bg-white/5" />
              <Skeleton className="h-12 w-full bg-white/5" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const item: NormalizedProduct | null = dbProduct
    ? {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        shortDescription: dbProduct.shortDescription,
        description: dbProduct.description,
        brandName: dbProduct.brandName,
        brandId: dbProduct.brandId ?? 0,
        categoryId: dbProduct.categoryId ?? 0,
        basePrice: dbProduct.basePrice,
        salePrice: dbProduct.salePrice,
        currency: dbProduct.currency,
        isInStock: dbProduct.isInStock ?? true,
        specifications: dbProduct.specifications as string | object | null | undefined,
        warrantyMonths: dbProduct.warrantyMonths,
        images: (dbProduct.images ?? []).map((img: { url: string }) => ({ url: img.url })),
        sku: dbProduct.sku,
      }
    : staticProduct
      ? {
          id: staticProduct.id,
          slug: staticProduct.slug,
          name: staticProduct.name,
          shortDescription: staticProduct.shortDescription,
          description: staticProduct.description as string | null,
          brandName: staticProduct.brandName,
          brandId: staticProduct.brandId,
          categoryId: staticProduct.categoryId,
          basePrice: staticProduct.basePrice,
          salePrice: staticProduct.salePrice,
          currency: staticProduct.currency,
          isInStock: staticProduct.isInStock,
          specifications: staticProduct.specifications as string | null,
          warrantyMonths: null,
          images: staticProduct.imageUrl ? [{ url: staticProduct.imageUrl }] : [],
          sku: null,
        }
      : null;

  if (!item) {
    return (
      <MainLayout>
        <div className="container py-24 text-center">
          <PackageX size={56} className="mx-auto text-white/30 mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Product Not Found</h2>
          <p className="text-white/50 mb-8">
            This product may have been removed or the link is incorrect.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[#4ade80] border border-[#4ade80]/30 hover:bg-[#4ade80]/10 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </MainLayout>
    );
  }

  const basePriceNum = Number(item.basePrice);
  const salePriceNum = item.salePrice ? Number(item.salePrice) : null;
  const hasDiscount = salePriceNum !== null && salePriceNum < basePriceNum;
  const displayPrice = hasDiscount ? salePriceNum! : basePriceNum;
  const discountPct = hasDiscount
    ? Math.round(((basePriceNum - salePriceNum!) / basePriceNum) * 100)
    : 0;
  const savings = hasDiscount ? basePriceNum - salePriceNum! : 0;

  const rating = 4 + ((item.id * 7) % 10) / 10;
  const reviewCount = 50 + ((item.id * 37) % 450);
  const soldCount = 120 + ((item.id * 53) % 880);

  const images =
    item.images.length > 0
      ? item.images.map(img => img.url)
      : [
          BRAND_FALLBACK_IMAGES[item.brandId] ??
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
        ];
  const thumbnails = [0, 1, 2].map(i => images[i % images.length]);
  const mainImageUrl = images[selectedImage] ?? images[0];
  const fallbackImage =
    BRAND_FALLBACK_IMAGES[item.brandId] ??
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80";

  const specs: Record<string, unknown> | null = item.specifications
    ? typeof item.specifications === "string"
      ? JSON.parse(item.specifications)
      : (item.specifications as Record<string, unknown>)
    : null;

  const relatedProducts =
    relatedDb && relatedDb.length > 0
      ? relatedDb
      : STATIC_PRODUCTS.filter(p => p.brandId === item.brandId && p.id !== item.id).slice(0, 4);

  const handleAddToCart = async () => {
    await addItem(item.id, Number(displayPrice), item.name, undefined, quantity, true);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = async () => {
    await addItem(item.id, Number(displayPrice), item.name, undefined, quantity, false);
    setLocation("/checkout");
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "description", label: "Description" },
    { key: "specifications", label: "Specifications" },
    { key: "reviews", label: "Reviews" },
  ];

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="border-b border-white/8 py-3">
        <div className="container text-xs text-white/40 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white/70 transition-colors">Products</Link>
          {item.brandName && (
            <>
              <span>/</span>
              <span className="text-white/40">{item.brandName}</span>
            </>
          )}
          <span>/</span>
          <span className="text-white/70 truncate max-w-[200px]">{item.name}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container py-8 md:py-14">
          {/* Main product section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

            {/* LEFT: Image gallery */}
            <div>
              {/* Main image */}
              <div
                className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={mainImageUrl}
                    alt={item.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = fallbackImage; }}
                  />
                </AnimatePresence>

                {/* Image counter */}
                <div
                  className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-xs text-white/80"
                  style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
                >
                  {selectedImage + 1} / {images.length}
                </div>

                {hasDiscount && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-black text-xs font-bold px-2.5 py-1 rounded-full bg-[#4ade80]">
                      {discountPct}% OFF
                    </span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 z-10">
                  {item.isInStock ? (
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{
                        background: "rgba(74,222,128,0.12)",
                        border: "1px solid rgba(74,222,128,0.3)",
                        color: "#4ade80",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      In Stock
                    </span>
                  ) : (
                    <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(prev => (prev - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/20"
                      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedImage(prev => (prev + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/20"
                      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2">
                {thumbnails.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i % images.length)}
                    className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden transition-all"
                    style={{
                      border: selectedImage === i % images.length
                        ? "2px solid #4ade80"
                        : "2px solid rgba(255,255,255,0.08)",
                      opacity: selectedImage === i % images.length ? 1 : 0.45,
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = fallbackImage; }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Product info */}
            <div>
              {item.brandName && (
                <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-[#4ade80]">
                  {item.brandName}
                </p>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
                {item.name}
              </h1>

              <StarRating rating={rating} count={reviewCount} />
              <div className="text-xs text-white/40 mt-1 mb-6">{soldCount} sold</div>

              {/* Price */}
              <div
                className="mb-6 p-4 rounded-xl"
                style={{
                  background: "rgba(74,222,128,0.05)",
                  border: "1px solid rgba(74,222,128,0.12)",
                }}
              >
                {hasDiscount ? (
                  <>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-4xl font-black text-white">
                        LKR {displayPrice.toLocaleString()}
                      </span>
                      <span className="text-xl text-white/35 line-through">
                        LKR {basePriceNum.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-black bg-[#4ade80]">
                        {discountPct}% OFF
                      </span>
                    </div>
                    <div className="text-sm font-semibold mt-1 text-[#4ade80]">
                      You Save LKR {savings.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <span className="text-4xl font-black text-white">
                    LKR {displayPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="mb-6 h-px bg-white/8" />

              {/* Short description */}
              {item.shortDescription && (
                <div className="mb-6">
                  <p
                    className="text-white/60 text-sm leading-relaxed"
                    style={
                      !descExpanded
                        ? { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }
                        : undefined
                    }
                  >
                    {item.shortDescription}
                  </p>
                  {item.shortDescription.length > 120 && (
                    <button
                      onClick={() => setDescExpanded(e => !e)}
                      className="text-xs mt-1 text-[#4ade80] hover:text-[#86efac] transition-colors"
                    >
                      {descExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold text-white/70">Quantity</span>
                <div
                  className="flex items-center rounded-xl overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}
                >
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!item.isInStock}
                  className="flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={
                    addedToCart
                      ? { background: "rgba(74,222,128,0.2)", border: "1px solid #4ade80", color: "#4ade80" }
                      : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80" }
                  }
                >
                  {addedToCart ? <Check size={16} /> : <ShoppingCart size={16} />}
                  {addedToCart ? "Added to Cart!" : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!item.isInStock}
                  className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-black transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #4ade80, #22c55e)" }}
                >
                  <Zap size={16} /> Buy Now
                </button>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Truck, label: "Free Delivery" },
                  { icon: Shield, label: "Warranty" },
                  { icon: RotateCcw, label: "7-Day Returns" },
                  { icon: Lock, label: "Secure Pay" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center p-2.5 rounded-xl transition-colors hover:bg-white/5"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <Icon size={16} className="mb-1 text-[#4ade80]" />
                    <div className="text-[10px] font-semibold text-white/50 leading-tight">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-16">
            {/* Tab bar */}
            <div
              className="flex gap-0 mb-6 rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 py-3 text-sm font-medium transition-all"
                  style={
                    activeTab === tab.key
                      ? {
                          color: "#4ade80",
                          borderBottom: "2px solid #4ade80",
                          background: "rgba(74,222,128,0.06)",
                        }
                      : {
                          color: "rgba(255,255,255,0.4)",
                          borderBottom: "2px solid transparent",
                        }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              {activeTab === "specifications" && (
                <>
                  {specs && Object.keys(specs).length > 0 ? (
                    <dl className="divide-y divide-white/10">
                      {Object.entries(specs).map(([key, value], i) => (
                        <div
                          key={key}
                          className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-1 sm:gap-3 py-3"
                          style={i % 2 === 0 ? { background: "rgba(255,255,255,0.03)" } : undefined}
                        >
                          <dt className="text-sm text-white/80 font-semibold">{key}</dt>
                          <dd className="text-sm text-white font-medium">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-white/70 text-sm">Specifications not available for this product.</p>
                  )}
                </>
              )}

              {activeTab === "description" && (
                <>
                  {item.description ? (
                    <div
                      className="prose prose-sm max-w-none leading-relaxed text-white/90 prose-headings:text-white prose-strong:text-white font-medium"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  ) : item.shortDescription ? (
                    <p className="text-white/90 leading-relaxed font-medium">{item.shortDescription}</p>
                  ) : (
                    <p className="text-white/70 text-sm">No description available.</p>
                  )}
                </>
              )}

              {activeTab === "reviews" && (
                <div className="text-center py-8">
                  <StarRating rating={rating} count={reviewCount} />
                  <p className="text-white/40 text-sm mt-4">Detailed reviews coming soon.</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-12 border-t border-white/8">
              <div className="mb-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-[#4ade80]">
                  You Might Also Like
                </p>
                <h2 className="text-2xl font-black text-white">Related Products</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
                {(relatedProducts.slice(0, 4) as React.ComponentProps<typeof ProductCard>[]).map(
                  (related, i) => (
                    <motion.div
                      key={related.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                    >
                      <ProductCard
                        id={related.id}
                        slug={related.slug}
                        name={related.name}
                        brandName={related.brandName ?? ""}
                        basePrice={related.basePrice}
                        salePrice={related.salePrice}
                        currency={related.currency ?? "LKR"}
                        isInStock={related.isInStock}
                        imageUrl={
                          related.imageUrl ||
                          ((related as any).images && (related as any).images.length > 0
                            ? (related as any).images[0].url
                            : undefined)
                        }
                      />
                    </motion.div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
}
