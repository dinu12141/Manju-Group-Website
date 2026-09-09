import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export interface HeroVideoAd {
  videoUrl: string;
  title: string;
  subtitle: string;
  badge: string;
  linkUrl: string;
  autoPlay: boolean;
  enableSound?: boolean;
  volume?: number;
}

export interface HeroFlashSaleAd {
  badge: string;
  title: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  linkUrl: string;
}

export interface HeroSlideAd {
  id: string;
  badge: string;
  title: string;
  category: string;
  price: string;
  imageUrl: string;
  linkUrl: string;
}

export interface PromoBannerAd {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
  linkUrl: string;
  gradientTheme: "ebike" | "smarttv" | "water" | "ac" | "gold";
}

export interface HomeAdConfig {
  heroVideo: HeroVideoAd;
  heroFlashSale: HeroFlashSaleAd;
  heroSlides: HeroSlideAd[];
  promoBanners: PromoBannerAd[];
}

export const PRESET_AD_MEDIA = [
  { label: "Hero Promo Video", path: "/promo-video.mp4", type: "video" },
  {
    label: "Dew Motors Black E-Bike (YW05)",
    path: "/ads/ad_dew_motors_black_ebike.webp",
    type: "image",
  },
  {
    label: "Dew Motors Red E-Bike (Easy Installment)",
    path: "/ads/ad_dew_motors_red_ebike.webp",
    type: "image",
  },
  {
    label: "Dew Plus Smart TV 4K",
    path: "/ads/ad_dew_plus_smart_tv.webp",
    type: "image",
  },
  {
    label: "Manju Dew Super RO Water Filter",
    path: "/ads/ad_dew_super_ro_system_1.webp",
    type: "image",
  },
  {
    label: "Manju Dew Super RO+ Promo Banner",
    path: "/ads/ad_dew_super_ro_system_2.webp",
    type: "image",
  },
  {
    label: "Cinematic E-Bike Banner",
    path: "/banner_ebike_cinematic.webp",
    type: "image",
  },
  {
    label: "Cinematic Smart TV Banner",
    path: "/banner_smarttv_cinematic.webp",
    type: "image",
  },
  {
    label: "DEW+ Inverter AC Unit",
    path: "/dew_plus_ac_1_5ton.webp",
    type: "image",
  },
];

export const DEFAULT_AD_CONFIG: HomeAdConfig = {
  heroVideo: {
    videoUrl: "/promo-video.mp4",
    title: "Manju Group Manufacturing",
    subtitle:
      "Excellence in engineering and production. Delivering quality worldwide.",
    badge: "Official Showcase",
    linkUrl: "/products",
    autoPlay: true,
    enableSound: true,
    volume: 1.0,
  },
  heroFlashSale: {
    badge: "Flash Sale",
    title: "Dew Motors - EM005 2400W E-Bike",
    price: "680,000",
    originalPrice: "720,000",
    imageUrl: "/ads/ad_dew_motors_black_ebike.webp",
    linkUrl: "/products/dew-motors-em005-2400w",
  },
  heroSlides: [
    {
      id: "slide-1",
      badge: "Water Solutions",
      title: "Dew Super 6-Stage RO Water Filter",
      category: "Pure Water",
      price: "14,900 Down",
      imageUrl: "/ads/ad_dew_super_ro_system_1.webp",
      linkUrl: "/products/dew-super-ro-water-filter",
    },
    {
      id: "slide-2",
      badge: "Entertainment",
      title: "Dew Plus 55'' 4K Smart TV",
      category: "Cinema Experience",
      price: "Rs. 169,500",
      imageUrl: "/ads/ad_dew_plus_smart_tv.webp",
      linkUrl: "/products/dew-plus-smart-tv-55",
    },
    {
      id: "slide-3",
      badge: "Cooling Tech",
      title: "DEW+ Inverter 1.5 Ton AC",
      category: "Energy Saving",
      price: "Rs. 185,000",
      imageUrl: "/dew_plus_ac_1_5ton.webp",
      linkUrl: "/products/dew-plus-inverter-split-air-conditioner-1-5-ton",
    },
    {
      id: "slide-4",
      badge: "Eco Mobility",
      title: "Dew Motors Super YW05 E-Bike",
      category: "110Km Range",
      price: "Rs. 100,000 Down",
      imageUrl: "/ads/ad_dew_motors_red_ebike.webp",
      linkUrl: "/products/dew-motors-yw06-2000w",
    },
  ],
  promoBanners: [
    {
      id: "promo-1",
      badge: "NEW ARRIVALS 2026",
      title: "Dew Motors Electric Bikes",
      subtitle: "Eco-Friendly · 80km Range · 2400W Power",
      buttonText: "Explore Models",
      imageUrl: "/banner_ebike_cinematic.webp",
      linkUrl: "/products?categoryId=1",
      gradientTheme: "ebike",
    },
    {
      id: "promo-2",
      badge: "LIMITED TIME OFFER",
      title: "Dew Plus 4K Frameless Smart TVs",
      subtitle: "4K UHD · Android 12 · Immersive Audio",
      buttonText: "Discover Deals",
      imageUrl: "/banner_smarttv_cinematic.webp",
      linkUrl: "/products?categoryId=2",
      gradientTheme: "smarttv",
    },
  ],
};

const STORAGE_KEY = "manju_home_ad_config";
const SITE_SETTING_KEY = "home_ad_config";

// Merge a possibly-partial config (from localStorage cache or DB row) over
// the shipped defaults so newly added fields never come back undefined.
function mergeWithDefaults(
  parsed: Partial<HomeAdConfig> | null | undefined
): HomeAdConfig {
  if (!parsed) return DEFAULT_AD_CONFIG;
  return {
    ...DEFAULT_AD_CONFIG,
    ...parsed,
    heroVideo: {
      ...DEFAULT_AD_CONFIG.heroVideo,
      ...(parsed.heroVideo || {}),
    },
    heroFlashSale: {
      ...DEFAULT_AD_CONFIG.heroFlashSale,
      ...(parsed.heroFlashSale || {}),
    },
    heroSlides: parsed.heroSlides?.length
      ? parsed.heroSlides
      : DEFAULT_AD_CONFIG.heroSlides,
    promoBanners: parsed.promoBanners?.length
      ? parsed.promoBanners
      : DEFAULT_AD_CONFIG.promoBanners,
  };
}

// Client-side cache only — no longer the source of truth. The DB
// (site_settings row keyed "home_ad_config") is authoritative; this is just
// used as an instant-paint fallback before the tRPC query resolves.
export function getStoredAdConfig(): HomeAdConfig {
  if (typeof window === "undefined") return DEFAULT_AD_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AD_CONFIG;
    return mergeWithDefaults(JSON.parse(raw));
  } catch (e) {
    console.error("Failed to parse stored ad config:", e);
    return DEFAULT_AD_CONFIG;
  }
}

export function saveStoredAdConfig(config: HomeAdConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("manju_ad_config_updated"));
}

// DB-backed ad settings. Reads via trpc.admin.getSiteSetting (public-safe
// query) and writes via trpc.admin.setSiteSetting (admin-only mutation).
// localStorage is kept as an instant-paint cache/fallback only.
export function useAdSettings(): {
  config: HomeAdConfig;
  updateConfig: (newConfig: HomeAdConfig) => void;
  resetConfig: () => void;
  isLoading: boolean;
  isSaving: boolean;
} {
  const [config, setConfig] = useState<HomeAdConfig>(getStoredAdConfig);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getSiteSetting.useQuery({
    key: SITE_SETTING_KEY,
  });

  const setSiteSettingMutation = trpc.admin.setSiteSetting.useMutation({
    onSuccess: () => {
      utils.admin.getSiteSetting.invalidate({ key: SITE_SETTING_KEY });
    },
  });

  // Once the DB value arrives, it becomes the source of truth and is mirrored
  // into the local cache so subsequent loads paint instantly.
  useEffect(() => {
    if (data?.value) {
      const merged = mergeWithDefaults(data.value as Partial<HomeAdConfig>);
      setConfig(merged);
      saveStoredAdConfig(merged);
    }
  }, [data]);

  const updateConfig = (newConfig: HomeAdConfig) => {
    setConfig(newConfig);
    saveStoredAdConfig(newConfig);
    setSiteSettingMutation.mutate({ key: SITE_SETTING_KEY, value: newConfig });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_AD_CONFIG);
    saveStoredAdConfig(DEFAULT_AD_CONFIG);
    setSiteSettingMutation.mutate({
      key: SITE_SETTING_KEY,
      value: DEFAULT_AD_CONFIG,
    });
  };

  return {
    config,
    updateConfig,
    resetConfig,
    isLoading,
    isSaving: setSiteSettingMutation.isPending,
  };
}
