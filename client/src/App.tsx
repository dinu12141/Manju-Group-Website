import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Brands from "./pages/Brands";
import BrandPage from "./pages/BrandPage";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Locations from "./pages/Locations";
import FAQ from "./pages/FAQ";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";

import ScrollToTop from "./components/ScrollToTop";

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:slug">
          {params => <ProductDetail params={params as { slug: string }} />}
        </Route>
        <Route path="/brands" component={Brands} />
        <Route path="/brands/:slug">
          {params => <BrandPage params={params as { slug: string }} />}
        </Route>
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/locations" component={Locations} />
        <Route path="/faq" component={FAQ} />
        <Route path="/news" component={News} />
        <Route path="/news/:slug">
          {params => <NewsDetail params={params as { slug: string }} />}
        </Route>
        <Route path="/account" component={Account} />
        <Route path="/admin" component={Admin} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
