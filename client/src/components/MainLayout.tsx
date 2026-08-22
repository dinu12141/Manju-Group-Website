import { useEffect } from "react";
import Lenis from "lenis";
import Header from "./Header";
import Footer from "./Footer";
import AIChatWidget from "./AIChatWidget";
import SceneCanvas from "./home/SceneCanvas";
import MobileBottomNav from "./MobileBottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export default function MainLayout({
  children,
  hideFooter = false,
}: MainLayoutProps) {
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
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans">
      {/* R3F particle canvas — fixed, behind everything */}
      <SceneCanvas />

      {/* Radial blue bloom gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,82,180,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Main content above canvas layers */}
      <div className="relative z-10 min-h-screen flex flex-col pb-16 md:pb-0">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        {!hideFooter && <Footer />}
        <AIChatWidget />
        <MobileBottomNav />
      </div>
    </div>
  );
}
