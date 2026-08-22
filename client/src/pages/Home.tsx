import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import MainLayout from "@/components/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import PopularCategories from "@/components/home/PopularCategories";
import SuggestionsSection from "@/components/home/SuggestionsSection";
import PromoBanners from "@/components/home/PromoBanners";
import ServicesSection from "@/components/home/ServicesSection";
import ProductGrid from "@/components/home/ProductGrid";
import { STATIC_PRODUCTS } from "@/lib/staticData";

const products = STATIC_PRODUCTS.map(p => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  price: p.salePrice ? Number(p.salePrice) : Number(p.basePrice),
  originalPrice: p.salePrice ? Number(p.basePrice) : undefined,
  image: p.imageUrl,
}));

export default function Home() {
  useSmoothScroll();
  return (
    <MainLayout>
      <HeroSection />

      {/* Kapruka Style Added Sections */}
      <PopularCategories />
      <SuggestionsSection />

      {/* Product Categories Grids & Banners */}
      <ProductGrid
        title="Top Selling Categories"
        items={products.slice(0, 5)}
      />
      <ProductGrid
        title="Smart TVs"
        items={products.filter(p => p.name.includes("TV")).slice(0, 5)}
      />
      <ProductGrid
        title="Electric Bikes"
        items={products
          .filter(p => p.name.includes("Bike") || p.name.includes("Scooter"))
          .slice(0, 5)}
      />
      <ProductGrid
        title="Air Conditioners"
        items={products.filter(p => p.name.includes("AC")).slice(0, 5)}
      />

      <PromoBanners />

      <ServicesSection />
    </MainLayout>
  );
}
