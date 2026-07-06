# Manju Group E-Commerce Platform — TODO

## Design System & Infrastructure
- [x] Global CSS design tokens (colors, fonts, spacing, shadows)
- [x] Google Fonts integration (Inter + Poppins)
- [x] Database schema: products, categories, brands, variants, cart, orders, wishlist, reviews, locations, blog posts, faqs, contact_submissions
- [x] tRPC routers: products, cart, orders, wishlist, admin, locations, blog, faq, contact, ai-chat, brands

## Navigation & Layout
- [x] Top announcement bar
- [x] Responsive header with logo, mega menu, search bar, cart icon, account icon
- [x] Mobile hamburger menu with drawer
- [x] Footer with brand links, social icons, quick links, contact info
- [x] Global layout wrapper (MainLayout)

## Homepage
- [x] Hero banner carousel (auto-play, brand-themed slides)
- [x] Brand showcase section (5 sub-brands with logos/cards)
- [x] Featured categories grid (shop by category: Electric Bikes, Smart TVs, ACs, Water Filters, Stationery)
- [x] Best-selling products section
- [x] Promotional banners
- [x] Why Choose Manju Group section (stats)

## Product Catalog
- [x] Products listing page with grid/list toggle
- [x] Brand filter sidebar
- [x] Sort options (price, popularity, newest)
- [x] Search results page
- [x] Pagination

## Product Detail Page
- [x] Image gallery
- [x] Variant selector (model)
- [x] Price display with original/discounted
- [x] Stock status
- [x] Quantity selector (passed to cart)
- [x] Add to cart button
- [x] Add to wishlist button
- [x] Product specifications tab
- [x] Product description tab
- [x] Related products

## Brand Pages
- [x] Brands listing page (all 5 brands)
- [x] Individual brand page: Dew Motors
- [x] Individual brand page: Dew Plus
- [x] Individual brand page: DEW+ AC
- [x] Individual brand page: Manju Dew Super
- [x] Individual brand page: Manju Exercise Books

## Shopping Cart
- [x] Cart page with item list
- [x] Quantity update / remove item
- [x] Subtotal calculation
- [x] Persistent cart (DB-backed per user, sessionId for guests)
- [x] Cart icon with live item count in header

## Customer Account
- [x] Login/Register page (Manus OAuth)
- [x] Account dashboard with tabs
- [x] Order history tab
- [x] Wishlist tab
- [x] Profile management tab

## Static / Content Pages
- [x] About page (mission, vision, values, timeline)
- [x] Contact page with form
- [x] News / Blog listing page
- [x] Blog post detail page
- [x] Locations page with branch cards
- [x] Google Maps embed with directions links for all branches
- [x] FAQ page with searchable accordion and category filter

## Admin Dashboard (admin-role gated)
- [x] Dashboard overview (stats: orders, revenue, products, customers)
- [x] Product management (list + toggle active; add/edit/delete are UI placeholders)
- [x] Order management (list + update status; order detail view is placeholder)
- [x] Customer management (read-only list)
- [x] Analytics charts (revenue bar chart using recharts, last 6 months)

## AI Chat Assistant
- [x] Floating chat button with online indicator
- [x] Chat drawer/modal UI with message history
- [x] LLM-powered product Q&A (gpt-4o-mini, static system prompt with brand/product info)
- [x] Quick prompt suggestions
- [x] Brand/product comparison support

## Testing
- [x] 18 vitest tests passing: auth, admin access control, brands, products, cart, faq, locations, blog, contact, wishlist, orders

## Bug Fixes
- [x] Fixed /account/wishlist and /account/orders broken sub-routes → /account
- [x] Fixed /faqs → /faq in footer
- [x] Fixed [object Object] opening hours display → parsed JSON rendering
- [x] Fixed ProductDetail quantity not passed to cart
- [x] Fixed CartContext addItem signature to accept optional quantity parameter
