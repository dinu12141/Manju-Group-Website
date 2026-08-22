import { Home, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <MainLayout>
      <div className="min-h-[70vh] w-full flex items-center justify-center bg-white py-20">
        <div className="w-full max-w-md mx-4 text-center">
          <div
            className="text-[140px] font-black leading-none select-none mb-2 font-display"
            style={{ color: "#0F2D5E" }}
          >
            404
          </div>

          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-5 h-px" style={{ background: "#C9A84C" }} />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "#C9A84C" }}
            >
              Page Not Found
            </span>
            <span className="w-5 h-px" style={{ background: "#C9A84C" }} />
          </div>

          <h1
            className="text-3xl font-bold font-display mb-3"
            style={{ color: "#0F2D5E" }}
          >
            Oops! Lost in the Store
          </h1>

          <p className="text-gray-700 font-medium mb-8 leading-relaxed text-sm max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setLocation("/")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: "#0F2D5E" }}
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
            <button
              onClick={() => setLocation("/products")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:border-[#0F2D5E] hover:text-[#0F2D5E] transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
