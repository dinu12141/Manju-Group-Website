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
        title="Smart TVs"
        viewAllHref="/products?categoryId=2"
        items={STATIC_PRODUCTS.filter(p => p.categoryId === 2).map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.salePrice ? Number(p.salePrice) : Number(p.basePrice),
          originalPrice: p.salePrice ? Number(p.basePrice) : undefined,
          image: p.imageUrl,
        }))}
      />
      <ProductGrid
        title="Electric Bikes"
        viewAllHref="/products?categoryId=1"
        items={STATIC_PRODUCTS.filter(p => p.categoryId === 1).map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.salePrice ? Number(p.salePrice) : Number(p.basePrice),
          originalPrice: p.salePrice ? Number(p.basePrice) : undefined,
          image: p.imageUrl,
        }))}
      />
      <ProductGrid
        title="Air Conditioners"
        viewAllHref="/products?categoryId=3"
        items={STATIC_PRODUCTS.filter(p => p.categoryId === 3).map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.salePrice ? Number(p.salePrice) : Number(p.basePrice),
          originalPrice: p.salePrice ? Number(p.basePrice) : undefined,
          image: p.imageUrl,
        }))}
      />
      <ProductGrid
        title="Water Filters & RO Systems"
        viewAllHref="/products?categoryId=4"
        items={STATIC_PRODUCTS.filter(p => p.categoryId === 4).map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.salePrice ? Number(p.salePrice) : Number(p.basePrice),
          originalPrice: p.salePrice ? Number(p.basePrice) : undefined,
          image: p.imageUrl,
        }))}
      />

      <PromoBanners />

      <ServicesSection />
    </MainLayout>
  );
}
