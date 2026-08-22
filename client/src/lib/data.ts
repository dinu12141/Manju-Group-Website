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
  "manju-exercise-books": {
    color: "#7C3AED",
    bgGradient: "from-[#7C3AED] to-[#6D28D9]",
    icon: "📚",
    emoji: "📚",
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
  {
    slug: "manju-exercise-books",
    name: "Manju Exercise Books",
    tagline: "School Stationery",
    icon: "📚",
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

