-- Migration: Enable Row Level Security (RLS) on all public tables
-- Fixes Supabase Security Advisor lint 0013_rls_disabled_in_public

-- 1. Products & Catalog
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products" ON public.products FOR SELECT USING (true);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_variants" ON public.product_variants;
CREATE POLICY "public_read_product_variants" ON public.product_variants FOR SELECT USING (true);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_brands" ON public.brands;
CREATE POLICY "public_read_brands" ON public.brands FOR SELECT USING (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_images" ON public.product_images;
CREATE POLICY "public_read_product_images" ON public.product_images FOR SELECT USING (true);

-- 2. Marketing & Content
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_banners" ON public.banners;
CREATE POLICY "public_read_banners" ON public.banners FOR SELECT USING (true);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_posts" ON public.blog_posts;
CREATE POLICY "public_read_blog_posts" ON public.blog_posts FOR SELECT USING (true);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_faqs" ON public.faqs;
CREATE POLICY "public_read_faqs" ON public.faqs FOR SELECT USING (true);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_locations" ON public.locations;
CREATE POLICY "public_read_locations" ON public.locations FOR SELECT USING (true);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON public.reviews;
CREATE POLICY "public_read_reviews" ON public.reviews FOR SELECT USING (true);

-- 3. Sensitive / User / Financial Data (Strictly restricted from unauthorized PostgREST access)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 4. Secure SECURITY DEFINER functions from public PostgREST execution
-- Fixes Supabase lints 0028_anon_security_definer_function_executable & 0029_authenticated_security_definer_function_executable
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres, service_role;

