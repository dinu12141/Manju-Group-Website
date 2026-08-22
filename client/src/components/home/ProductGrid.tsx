import { Link } from "wouter";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  title: string;
  viewAllHref?: string;
  items: Array<{
    id: string | number;
    slug: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
  }>;
}

export default function ProductGrid({
  title,
  viewAllHref = "/products",
  items,
}: ProductGridProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="w-full bg-[#f4f4f4] py-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight font-display">
              {title}
            </h2>
            <Link
              href={viewAllHref}
              className="text-sm text-[#0052B4] hover:text-[#003875] hover:underline font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item, i) => (
              <ProductCard
                key={i}
                id={item.id}
                slug={item.slug}
                name={item.name}
                price={item.price}
                originalPrice={item.originalPrice}
                image={item.image}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
