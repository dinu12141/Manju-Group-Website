import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
}: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(id, price, name, undefined, 1);
  };

  return (
    <div className="bg-white rounded border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group relative overflow-hidden">
      <Link
        href={`/products/${slug}`}
        className="block relative pt-[100%] overflow-hidden bg-gray-50"
      >
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {originalPrice && originalPrice > price && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </span>
        )}
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <Link
          href={`/products/${slug}`}
          className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-[#0052B4] transition-colors flex-1 mb-2"
        >
          {name}
        </Link>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">
              Rs. {price.toLocaleString()}
            </div>
            {originalPrice && (
              <div className="text-xs text-gray-500 line-through">
                Rs. {originalPrice.toLocaleString()}
              </div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-[#0052B4] hover:bg-[#003875] text-white p-2 rounded-lg transition-colors shadow-sm"
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
