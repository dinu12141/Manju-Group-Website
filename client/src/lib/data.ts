// Static brand data for UI (colors, icons, etc.)
export const BRAND_META: Record<
  string,
  {
    color: string;
    bgGradient: string;
    icon: string;
    emoji: string;
  }
> = {
  "dew-motors": {
    color: "#0F2D5E",
    bgGradient: "from-[#0F2D5E] to-[#1a4a8a]",
    icon: "⚡",
    emoji: "🏍️",
  },
  "dew-plus": {
    color: "#1a1a2e",
    bgGradient: "from-[#1a1a2e] to-[#16213e]",
    icon: "📺",
    emoji: "📺",
  },
  "dew-plus-ac": {
    color: "#0F2D5E",
    bgGradient: "from-[#0F2D5E] to-[#0891b2]",
    icon: "❄️",
    emoji: "❄️",
  },
  "manju-dew-super": {
    color: "#065F46",
    bgGradient: "from-[#065F46] to-[#047857]",
    icon: "💧",
    emoji: "💧",
  },
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Brands", href: "/brands" },
  { label: "News", href: "/news" },
  { label: "Locations", href: "/locations" },
  { label: "Contact", href: "/contact" },
];

export const MEGA_MENU_BRANDS = [
  {
    slug: "dew-motors",
    name: "Dew Motors",
    tagline: "Electric Bikes",
    icon: "⚡",
  },
  { slug: "dew-plus", name: "Dew Plus", tagline: "Smart TVs", icon: "📺" },
  {
    slug: "dew-plus-ac",
    name: "DEW+ AC",
    tagline: "Air Conditioners",
    icon: "❄️",
  },
  {
    slug: "manju-dew-super",
    name: "Manju Dew Super",
    tagline: "Water Filters",
    icon: "💧",
  },
];

export function formatPrice(price: number | string, currency = "LKR"): string {
  const num = Number(price);
  if (isNaN(num)) return `${currency} 0.00`;
  return `${currency} ${num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getDiscountPercent(
  base: number | string,
  sale: number | string
): number {
  const b = typeof base === "string" ? parseFloat(base) : base;
  const s = typeof sale === "string" ? parseFloat(sale) : sale;
  return Math.round(((b - s) / b) * 100);
}

// Session ID for guest cart
export function getSessionId(): string {
  const key = "manju_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function cleanText(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]*>/g, "")
    .trim();
}

export function getProductImage(
  imageUrl: string | null | undefined,
  name: string
): string {
  if (imageUrl && !imageUrl.includes("manjugroup.lk")) {
    return imageUrl;
  }
  const nameLower = (name || "").toLowerCase();
  if (
    nameLower.includes("32") &&
    (nameLower.includes("tv") || nameLower.includes("smart"))
  ) {
    return "/dew_plus_32_tv.webp";
  }
  if (
    nameLower.includes("43") &&
    (nameLower.includes("tv") || nameLower.includes("smart"))
  ) {
    return "/dew_plus_43_tv.webp";
  }
  if (
    nameLower.includes("55") &&
    (nameLower.includes("tv") || nameLower.includes("smart"))
  ) {
    return "/dew_plus_55_tv.webp";
  }
  if (
    nameLower.includes("65") &&
    (nameLower.includes("tv") || nameLower.includes("smart"))
  ) {
    return "/dew_plus_65_tv.webp";
  }
  if (
    nameLower.includes("75") &&
    (nameLower.includes("tv") || nameLower.includes("smart"))
  ) {
    return "/dew_plus_75_tv.webp";
  }
  if (
    nameLower.includes("98") &&
    (nameLower.includes("tv") || nameLower.includes("smart"))
  ) {
    return "/dew_plus_98_tv.webp";
  }
  if (
    nameLower.includes("1.5") ||
    (nameLower.includes("1_5") &&
      (nameLower.includes("ac") || nameLower.includes("air")))
  ) {
    return "/dew_plus_ac_1_5ton.webp";
  }
  if (
    nameLower.includes("2") &&
    (nameLower.includes("ac") || nameLower.includes("air"))
  ) {
    return "/dew_plus_ac_2ton.webp";
  }
  if (
    nameLower.includes("ac") ||
    nameLower.includes("air conditioner") ||
    nameLower.includes("inverter")
  ) {
    return "/dew_plus_ac_1ton.webp";
  }
  if (nameLower.includes("commercial") && nameLower.includes("3000")) {
    return "/dew_super_commercial_3000l.webp";
  }
  if (nameLower.includes("commercial") && nameLower.includes("2500")) {
    return "/dew_super_commercial_2500l.webp";
  }
  if (nameLower.includes("commercial") && nameLower.includes("500")) {
    return "/dew_super_commercial_500l.webp";
  }
  if (
    nameLower.includes("cool") ||
    (nameLower.includes("hot") &&
      (nameLower.includes("cold") || nameLower.includes("cool")))
  ) {
    return "/dew_super_hot_cold_dispenser.webp";
  }
  if (nameLower.includes("hot") && nameLower.includes("normal")) {
    return "/dew_super_hot_normal.webp";
  }
  if (nameLower.includes("ro+") || nameLower.includes("ro +")) {
    return "/dew_super_ro_plus.webp";
  }
  if (
    nameLower.includes("water") ||
    nameLower.includes("filter") ||
    nameLower.includes("purifier") ||
    nameLower.includes("dispenser") ||
    nameLower.includes("ro")
  ) {
    return "/ro_water_purifier.webp";
  }
  if (
    nameLower.includes("scooter") ||
    nameLower.includes("em003") ||
    nameLower.includes("silver") ||
    nameLower.includes("yw06")
  ) {
    return "/scooter_silver.webp";
  }
  if (
    nameLower.includes("bike") ||
    nameLower.includes("motor") ||
    nameLower.includes("electric") ||
    nameLower.includes("em005")
  ) {
    return "/scooter_red.webp";
  }
  return "/scooter_red.webp";
}

