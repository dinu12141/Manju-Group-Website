import { useEffect, useState, lazy, Suspense } from "react";
import Lenis from "lenis";
import Header from "./Header";
import Footer from "./Footer";
import AIChatWidget from "./AIChatWidget";
import MobileBottomNav from "./MobileBottomNav";

const SceneCanvas = lazy(() => import("./home/SceneCanvas"));

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export default function MainLayout({
  children,
  hideFooter = false,
}: MainLayoutProps) {
  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    // Decorative 3D background — defer until after first paint so the
    // heavy three.js bundle never blocks LCP/FCP on any route.
    const hasIdleCallback = typeof requestIdleCallback === "function";
    const id = hasIdleCallback
      ? requestIdleCallback(() => setShowScene(true))
      : window.setTimeout(() => setShowScene(true), 200);
    return () => {
      if (hasIdleCallback) cancelIdleCallback(id as number);
      else clearTimeout(id as number);
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-x-hidden font-sans">
      {/* R3F particle canvas — fixed, behind everything; deferred, non-critical */}
      {showScene && (
        <Suspense fallback={null}>
          <SceneCanvas />
        </Suspense>
      )}

      {/* Radial blue bloom gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,82,180,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Main content above canvas layers */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full bg-slate-50">{children}</main>
        {!hideFooter && <Footer />}
        <AIChatWidget />
        <MobileBottomNav />
        {/* Mobile bottom spacer to clear fixed bottom nav including safe area */}
        <div className="md:hidden w-full shrink-0" style={{ height: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}></div>
      </div>
    </div>
  );
}
