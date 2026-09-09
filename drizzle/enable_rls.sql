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

-- 3. Sensitive / User / Financial Data (Protected with explicit Row Level Security policies)
-- Fixes Supabase lints 0008_rls_enabled_no_policy

-- contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_insert_contact_messages" ON public.contact_messages;
CREATE POLICY "allow_insert_contact_messages" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_contact_messages" ON public.contact_messages;
CREATE POLICY "service_role_contact_messages" ON public.contact_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_own" ON public.users;
CREATE POLICY "users_read_own" ON public.users FOR SELECT TO authenticated USING ("openId" = (select auth.uid()::text));
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE TO authenticated USING ("openId" = (select auth.uid()::text)) WITH CHECK ("openId" = (select auth.uid()::text));
DROP POLICY IF EXISTS "service_role_users" ON public.users;
CREATE POLICY "service_role_users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_read_own" ON public.orders;
CREATE POLICY "orders_read_own" ON public.orders FOR SELECT TO authenticated USING ("userId" IN (SELECT id FROM public.users WHERE "openId" = (select auth.uid()::text)));
DROP POLICY IF EXISTS "service_role_orders" ON public.orders;
CREATE POLICY "service_role_orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);

-- order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_items_read_own" ON public.order_items;
CREATE POLICY "order_items_read_own" ON public.order_items FOR SELECT TO authenticated USING ("orderId" IN (SELECT id FROM public.orders WHERE "userId" IN (SELECT id FROM public.users WHERE "openId" = (select auth.uid()::text))));
DROP POLICY IF EXISTS "service_role_order_items" ON public.order_items;
CREATE POLICY "service_role_order_items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- carts
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "carts_own" ON public.carts;
CREATE POLICY "carts_own" ON public.carts FOR ALL TO authenticated USING ("userId" IN (SELECT id FROM public.users WHERE "openId" = (select auth.uid()::text))) WITH CHECK ("userId" IN (SELECT id FROM public.users WHERE "openId" = (select auth.uid()::text)));
DROP POLICY IF EXISTS "service_role_carts" ON public.carts;
CREATE POLICY "service_role_carts" ON public.carts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cart_items_own" ON public.cart_items;
CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL TO authenticated USING ("cartId" IN (SELECT id FROM public.carts WHERE "userId" IN (SELECT id FROM public.users WHERE "openId" = (select auth.uid()::text)))) WITH CHECK ("cartId" IN (SELECT id FROM public.carts WHERE "userId" IN (SELECT id FROM public.users WHERE "openId" = (select auth.uid()::text))));
DROP POLICY IF EXISTS "service_role_cart_items" ON public.cart_items;
CREATE POLICY "service_role_cart_items" ON public.cart_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wishlists_own" ON public.wishlists;
CREATE POLICY "wishlists_own" ON public.wishlists FOR ALL TO authenticated USING ("userId" IN (SELECT id FROM public.users WHERE "openId" = (select auth.uid()::text))) WITH CHECK ("userId" IN (SELECT id FROM public.users WHERE "openId" = (select auth.uid()::text)));
DROP POLICY IF EXISTS "service_role_wishlists" ON public.wishlists;
CREATE POLICY "service_role_wishlists" ON public.wishlists FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Secure SECURITY DEFINER functions from public PostgREST execution
-- Fixes Supabase lints 0028_anon_security_definer_function_executable & 0029_authenticated_security_definer_function_executable
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres, service_role;

