import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import MainLayout from "@/components/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import PopularCategories from "@/components/home/PopularCategories";
import SuggestionsSection from "@/components/home/SuggestionsSection";
import PromoBanners from "@/components/home/PromoBanners";
import ServicesSection from "@/components/home/ServicesSection";
import ProductGrid from "@/components/home/ProductGrid";
import { STATIC_PRODUCTS } from "@/lib/staticData";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";

type GridItem = {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
};

function mapStaticFallback(categoryId: number): GridItem[] {
  return STATIC_PRODUCTS.filter(p => p.categoryId === categoryId).map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.salePrice ? Number(p.salePrice) : Number(p.basePrice),
    originalPrice: p.salePrice ? Number(p.basePrice) : undefined,
    image: p.imageUrl,
  }));
}

function useCategoryProducts(categoryId: number, limit = 12) {
  const { data, isLoading } = trpc.products.list.useQuery({
    page: 1,
    limit,
    categoryId,
    sortBy: "newest",
  });

  const items: GridItem[] =
    data && data.items && data.items.length > 0
      ? data.items.map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.salePrice ?? p.basePrice,
          originalPrice: p.salePrice ? p.basePrice : undefined,
          image: p.imageUrl || "",
        }))
      : isLoading
        ? []
        : mapStaticFallback(categoryId);

  return { items, isLoading };
}

export default function Home() {
  useSmoothScroll();

  const smartTvs = useCategoryProducts(2);
  const electricBikes = useCategoryProducts(1);
  const airConditioners = useCategoryProducts(3);
  const waterFilters = useCategoryProducts(4);

  return (
    <MainLayout>
      <SEO
        title="Official Website | Sri Lanka's Premier Multi-Brand Group"
        description="Discover DEW Motors electric bikes, DEW Plus smart frameless TVs, industrial RO water purifiers, and inverter air conditioners with islandwide delivery in Sri Lanka."
        canonical="/"
        image="/manju-logo-transparent.webp"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Manju Group Official Website",
          "url": "https://manjugroup.lk",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://manjugroup.lk/products?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <HeroSection />

      {/* Kapruka Style Added Sections */}
      <PopularCategories />
      <SuggestionsSection />

      {/* Product Categories Grids & Banners */}
      <ProductGrid
        title="Smart TVs"
        viewAllHref="/products?categoryId=2"
        items={smartTvs.items}
      />
      <ProductGrid
        title="Electric Bikes"
        viewAllHref="/products?categoryId=1"
        items={electricBikes.items}
      />
      <ProductGrid
        title="Air Conditioners"
        viewAllHref="/products?categoryId=3"
        items={airConditioners.items}
      />
      <ProductGrid
        title="Water Filters & RO Systems"
        viewAllHref="/products?categoryId=4"
        items={waterFilters.items}
      />

      <PromoBanners />

      <ServicesSection />
    </MainLayout>
  );
}
