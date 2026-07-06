import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Shield,
  Truck,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Check,
  Share2,
  Minus,
  Plus,
  ImageOff,
  PackageX,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import MainLayout from "@/components/MainLayout";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, getDiscountPercent } from "@/lib/data";
import { toast } from "sonner";

interface ProductDetailProps {
  params: { slug: string };
}

function ProductImagePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300">
      <ImageOff size={72} strokeWidth={1.5} />
    </div>
  );
}

export default function ProductDetail({ params }: ProductDetailProps) {
  const { slug } = params;
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = trpc.products.bySlug.useQuery({ slug });

  const { data: relatedProducts } = trpc.products.related.useQuery(
    {
      productId: product?.id ?? 0,
      brandId: product?.brandId ?? 0,
      categoryId: product?.categoryId ?? 0,
    },
    { enabled: !!product?.id && !!product?.brandId && !!product?.categoryId }
  );

  const wishlistToggle = trpc.wishlist.toggle.useMutation({
    onSuccess: data => {
      toast.success(data.added ? "Added to wishlist" : "Removed from wishlist");
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container py-20">
          <EmptyState
            icon={<PackageX />}
            title="Product Not Found"
            description="This product may have been removed or the link is incorrect."
            action={
              <Link href="/products">
                <Button className="bg-navy hover:bg-navy-light text-white">
                  Browse All Products
                </Button>
              </Link>
            }
          />
        </div>
      </MainLayout>
    );
  }

  const displayPrice =
    product.salePrice && Number(product.salePrice) < Number(product.basePrice)
      ? product.salePrice
      : product.basePrice;
  const hasDiscount =
    product.salePrice && Number(product.salePrice) < Number(product.basePrice);
  const discount = hasDiscount
    ? getDiscountPercent(product.basePrice, product.salePrice!)
    : 0;
  const specs = product.specifications
    ? typeof product.specifications === "string"
      ? JSON.parse(product.specifications)
      : product.specifications
    : null;

  const handleAddToCart = () => {
    addItem(
      product.id,
      Number(displayPrice),
      product.name,
      selectedVariant ?? undefined,
      quantity
    );
    toast.success("Added to cart");
  };

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 py-3">
        <div className="container text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-navy">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-navy">
            Products
          </Link>
          {product.brandName && (
            <>
              <span>/</span>
              <Link
                href={`/brands/${product.brandSlug}`}
                className="hover:text-navy"
              >
                {product.brandName}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3 shadow-card">
              <AnimatePresence mode="wait">
                {product.images && product.images.length > 0 ? (
                  <motion.img
                    key={selectedImage}
                    src={product.images[selectedImage]?.url}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <ProductImagePlaceholder />
                )}
              </AnimatePresence>
              {hasDiscount && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="badge-offer text-sm px-3 py-1">
                    {discount}% OFF
                  </span>
                </div>
              )}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        prev =>
                          (prev - 1 + product.images.length) %
                          product.images.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        prev => (prev + 1) % product.images.length
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? "border-navy shadow-sm"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.brandName && (
              <Link
                href={`/brands/${product.brandSlug}`}
                className="text-sm font-semibold text-navy hover:underline"
              >
                {product.brandName}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 font-display mt-1 mb-3">
              {product.name}
            </h1>

            {/* SKU */}
            <div className="text-xs text-gray-400 mb-4">SKU: {product.sku}</div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-navy">
                {formatPrice(displayPrice, product.currency || "LKR")}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.basePrice, product.currency || "LKR")}
                  </span>
                  <span className="badge-offer">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                {product.shortDescription}
              </p>
            )}

            {/* Buy box */}
            <div className="card-surface p-5 space-y-5 mb-5">
              {/* Stock status */}
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${product.isInStock ? "bg-green" : "bg-red-400"}`}
                />
                <span
                  className={`text-sm font-semibold ${product.isInStock ? "text-green" : "text-red-500"}`}
                >
                  {product.isInStock
                    ? "In Stock — Ready to Ship"
                    : "Out of Stock"}
                </span>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    Select Variant
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(variant => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant.id)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          selectedVariant === variant.id
                            ? "border-navy bg-navy text-white"
                            : "border-gray-200 text-gray-700 hover:border-navy"
                        }`}
                      >
                        {variant.name}
                        {variant.price && (
                          <span className="ml-1 text-xs opacity-70">
                            {formatPrice(
                              Number(variant.price),
                              product.currency || "LKR"
                            )}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <div className="text-sm font-semibold text-gray-700">
                  Quantity
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.isInStock}
                  className="flex-1 bg-navy hover:bg-navy-light text-white h-12 text-sm font-semibold flex items-center gap-2"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    wishlistToggle.mutate({ productId: product.id })
                  }
                  className="w-12 h-12 p-0 border-gray-200 hover:border-red-300 hover:text-red-500"
                  aria-label="Add to wishlist"
                >
                  <Heart size={18} />
                </Button>
                <Button
                  variant="outline"
                  className="w-12 h-12 p-0 border-gray-200"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied!");
                  }}
                  aria-label="Share product"
                >
                  <Share2 size={18} />
                </Button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <Shield size={18} className="text-navy mx-auto mb-1" />
                <div className="text-xs font-medium text-gray-700">
                  {product.warrantyMonths
                    ? `${product.warrantyMonths}M Warranty`
                    : "Warranty"}
                </div>
              </div>
              <div className="text-center">
                <Truck size={18} className="text-navy mx-auto mb-1" />
                <div className="text-xs font-medium text-gray-700">
                  Island-wide Delivery
                </div>
              </div>
              <div className="text-center">
                <Package size={18} className="text-navy mx-auto mb-1" />
                <div className="text-xs font-medium text-gray-700">
                  Genuine Product
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description, Specs, Reviews */}
        <Tabs defaultValue="description" className="mb-14">
          <TabsList className="border-b border-gray-100 rounded-none bg-transparent h-auto p-0 gap-6 w-full justify-start">
            {["description", "specifications", "reviews"].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="pb-3 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-navy data-[state=active]:text-navy text-gray-500 text-sm font-medium capitalize bg-transparent"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="description" className="pt-6">
            {product.description ? (
              <div
                className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-gray-500 text-sm">
                {product.shortDescription || "No description available."}
              </p>
            )}
          </TabsContent>

          <TabsContent value="specifications" className="pt-6">
            {specs && Object.keys(specs).length > 0 ? (
              <dl className="card-surface divide-y divide-gray-100 overflow-hidden">
                {Object.entries(specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-1 sm:gap-3 px-5 py-3 odd:bg-gray-50/60"
                  >
                    <dt className="text-sm text-gray-500">{key}</dt>
                    <dd className="text-sm font-medium text-gray-800">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-gray-500 text-sm">
                No specifications available.
              </p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map(review => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? "text-amber fill-amber"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Customer
                      </span>
                      {review.isVerified && (
                        <span className="text-xs text-green flex items-center gap-0.5">
                          <Check size={11} /> Verified
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <div className="text-sm font-semibold text-gray-800 mb-1">
                        {review.title}
                      </div>
                    )}
                    <p className="text-sm text-gray-600">{review.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <div className="mb-6">
              <div className="section-label">You May Also Like</div>
              <h2 className="section-title">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {relatedProducts.map(related => (
                <ProductCard
                  key={related.id}
                  id={related.id}
                  slug={related.slug}
                  name={related.name}
                  brandName={related.brandName}
                  basePrice={related.basePrice}
                  salePrice={related.salePrice}
                  currency={related.currency ?? "LKR"}
                  isInStock={related.isInStock}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
