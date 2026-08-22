import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import {
  brands,
  categories,
  products,
  productImages,
  productVariants,
  locations,
  faqs,
  blogPosts,
  banners,
} from "../drizzle/schema";

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  console.log("🌱 Connecting to database...");
  const db = drizzle(dbUrl);

  // ─── Clear existing data ─────────────────────────────────────────────
  console.log("🗑️  Clearing existing data...");
  try {
    await db.delete(productVariants);
    await db.delete(productImages);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(brands);
    await db.delete(locations);
    await db.delete(faqs);
    await db.delete(blogPosts);
    await db.delete(banners);
  } catch (e) {
    // Tables might not exist yet
  }

  // ─── Brands ───────────────────────────────────────────────────────────
  console.log("🏷️  Seeding brands...");
  await db.insert(brands).values([
    {
      id: 1,
      slug: "dew-motors",
      name: "Dew Motors",
      tagline: "Power Your Ride, Go Electric",
      description:
        "Dew Motors is Sri Lanka's leading electric motorcycle brand, offering eco-friendly, powerful electric bikes designed for daily commuting and adventure. With cutting-edge battery technology and sleek designs, Dew Motors is driving the future of sustainable transportation in Sri Lanka.",
      primaryColor: "#0ea5e9",
      accentColor: "#38bdf8",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 2,
      slug: "dew-plus",
      name: "Dew Plus",
      tagline: "Crystal Clear Entertainment",
      description:
        'Dew Plus brings premium 4K Android Smart TVs with built-in streaming apps, crystal clear displays, and immersive sound systems. Available in 32" to 65" sizes, perfect for every Sri Lankan home.',
      primaryColor: "#8b5cf6",
      accentColor: "#a78bfa",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 3,
      slug: "dew-plus-ac",
      name: "DEW+ AC",
      tagline: "Cool Comfort, Smart Living",
      description:
        "DEW+ AC offers energy-efficient inverter split air conditioners with R32 eco-friendly refrigerant. Available in 1 Ton, 1.5 Ton, and 2 Ton capacities with smart WiFi control, turbo cooling, and 5-year compressor warranty.",
      primaryColor: "#06b6d4",
      accentColor: "#22d3ee",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: 4,
      slug: "manju-dew-super",
      name: "Manju Dew Super",
      tagline: "Pure Water, Healthy Life",
      description:
        "Manju Dew Super water purifiers use advanced RO, UV, and UF filtration technology to deliver clean, safe drinking water. Available in multiple models including hot & cold dispensers, perfect for homes and offices.",
      primaryColor: "#3b82f6",
      accentColor: "#60a5fa",
      sortOrder: 4,
      isActive: true,
    },
    {
      id: 5,
      slug: "manju-exercise-books",
      name: "Manju Exercise Books",
      tagline: "Write Your Success Story",
      description:
        "Manju Exercise Books are trusted by students across Sri Lanka for quality, durability, and value. Available in various sizes, page counts, and ruling patterns for every educational need.",
      primaryColor: "#f59e0b",
      accentColor: "#fbbf24",
      sortOrder: 5,
      isActive: true,
    },
  ]);

  // ─── Categories ───────────────────────────────────────────────────────
  console.log("📂 Seeding categories...");
  await db.insert(categories).values([
    {
      id: 1,
      slug: "electric-bikes",
      name: "Electric Bikes",
      description: "Eco-friendly electric motorcycles and scooters",
      sortOrder: 1,
    },
    {
      id: 2,
      slug: "smart-tvs",
      name: "Smart TVs",
      description: "4K Android Smart Televisions",
      sortOrder: 2,
    },
    {
      id: 3,
      slug: "air-conditioners",
      name: "Air Conditioners",
      description: "Inverter split air conditioning units",
      sortOrder: 3,
    },
    {
      id: 4,
      slug: "water-filters",
      name: "Water Filters",
      description: "RO and UV water purification systems",
      sortOrder: 4,
    },
    {
      id: 5,
      slug: "stationery",
      name: "Stationery",
      description: "School exercise books and stationery",
      sortOrder: 5,
    },
  ]);

  // ─── Products ─────────────────────────────────────────────────────────
  console.log("📦 Seeding products...");
  const productData = [
    // Dew Motors - Electric Bikes
    {
      id: 1,
      slug: "dew-em005-2400w",
      sku: "DM-EM005",
      name: "Dew EM005 2400W Electric Bike",
      shortDescription: "Powerful 2400W electric motorcycle with 80km range",
      description:
        "The Dew EM005 is our flagship electric motorcycle featuring a powerful 2400W hub motor, 72V 32Ah lithium battery, and an impressive 80km range on a single charge. With a top speed of 70 km/h, disc brakes, LED headlights, and a digital dashboard, this bike is perfect for daily commuting in Sri Lanka.",
      brandId: 1,
      categoryId: 1,
      basePrice: "485000.00",
      salePrice: "449000.00",
      currency: "LKR",
      stockQuantity: 25,
      isInStock: true,
      isFeatured: true,
      isBestSeller: true,
      isNew: false,
      warrantyMonths: 12,
      specifications: JSON.stringify({
        Motor: "2400W Hub Motor",
        Battery: "72V 32Ah Lithium",
        Range: "80 km",
        "Top Speed": "70 km/h",
        "Charging Time": "4-5 hours",
        Brakes: "Disc (Front & Rear)",
        Weight: "95 kg",
      }),
      tags: JSON.stringify([
        "electric",
        "motorcycle",
        "eco-friendly",
        "commuter",
      ]),
    },
    {
      id: 2,
      slug: "dew-yw06-2000w",
      sku: "DM-YW06",
      name: "Dew YW06 2000W Electric Bike",
      shortDescription: "Affordable 2000W electric bike with 60km range",
      description:
        "The Dew YW06 is an affordable yet powerful electric motorcycle with a 2000W motor and 60V 28Ah battery providing 60km range. Featuring a comfortable riding position, USB charging port, and anti-theft alarm system.",
      brandId: 1,
      categoryId: 1,
      basePrice: "365000.00",
      salePrice: "339000.00",
      currency: "LKR",
      stockQuantity: 40,
      isInStock: true,
      isFeatured: true,
      isBestSeller: false,
      isNew: true,
      warrantyMonths: 12,
      specifications: JSON.stringify({
        Motor: "2000W Hub Motor",
        Battery: "60V 28Ah Lithium",
        Range: "60 km",
        "Top Speed": "55 km/h",
        "Charging Time": "3-4 hours",
        Brakes: "Disc (Front) / Drum (Rear)",
        Weight: "85 kg",
      }),
      tags: JSON.stringify([
        "electric",
        "motorcycle",
        "affordable",
        "commuter",
      ]),
    },
    {
      id: 3,
      slug: "dew-em003-1500w-scooter",
      sku: "DM-EM003",
      name: "Dew EM003 Electric Scooter",
      shortDescription: "Compact 1500W electric scooter for city rides",
      description:
        "The Dew EM003 is a compact, lightweight electric scooter perfect for city commuting. With a 1500W motor and 48V 20Ah battery, it offers 45km range and easy maneuverability through traffic.",
      brandId: 1,
      categoryId: 1,
      basePrice: "245000.00",
      salePrice: null,
      currency: "LKR",
      stockQuantity: 30,
      isInStock: true,
      isFeatured: false,
      isBestSeller: false,
      isNew: true,
      warrantyMonths: 12,
      specifications: JSON.stringify({
        Motor: "1500W Hub Motor",
        Battery: "48V 20Ah Lithium",
        Range: "45 km",
        "Top Speed": "45 km/h",
        "Charging Time": "3 hours",
        Brakes: "Disc (Front) / Drum (Rear)",
        Weight: "65 kg",
      }),
      tags: JSON.stringify(["electric", "scooter", "city", "compact"]),
    },
    // Dew Plus - Smart TVs
    {
      id: 4,
      slug: "dew-plus-32-hd-smart-tv",
      sku: "DP-TV32",
      name: 'Dew Plus 32" HD Smart TV',
      shortDescription: "32-inch HD Android Smart TV with built-in apps",
      description:
        'The Dew Plus 32" HD Smart TV features a vivid HD display, Android TV operating system with Google Play Store access, built-in Chromecast, dual-band WiFi, and powerful 20W speakers. Perfect for bedrooms and small living spaces.',
      brandId: 2,
      categoryId: 2,
      basePrice: "54900.00",
      salePrice: "49900.00",
      currency: "LKR",
      stockQuantity: 50,
      isInStock: true,
      isFeatured: true,
      isBestSeller: true,
      isNew: false,
      warrantyMonths: 24,
      specifications: JSON.stringify({
        "Screen Size": "32 inches",
        Resolution: "1366 x 768 HD",
        "Panel Type": "LED",
        OS: "Android TV 11",
        Sound: "20W (2x10W)",
        Connectivity: "WiFi, Bluetooth 5.0, HDMI x2, USB x2",
        "Refresh Rate": "60 Hz",
      }),
      tags: JSON.stringify(["smart-tv", "android", "hd", "32-inch"]),
    },
    {
      id: 5,
      slug: "dew-plus-43-4k-smart-tv",
      sku: "DP-TV43",
      name: 'Dew Plus 43" 4K UHD Smart TV',
      shortDescription: "43-inch 4K UHD Android TV with Dolby Audio",
      description:
        'Experience stunning 4K UHD visuals on the Dew Plus 43" Smart TV. Featuring HDR10, Dolby Audio, AI-powered picture engine, and voice control via Google Assistant. Comes with Netflix, YouTube, and Prime Video pre-installed.',
      brandId: 2,
      categoryId: 2,
      basePrice: "89900.00",
      salePrice: "79900.00",
      currency: "LKR",
      stockQuantity: 35,
      isInStock: true,
      isFeatured: true,
      isBestSeller: true,
      isNew: false,
      warrantyMonths: 24,
      specifications: JSON.stringify({
        "Screen Size": "43 inches",
        Resolution: "3840 x 2160 4K UHD",
        "Panel Type": "LED",
        OS: "Android TV 12",
        Sound: "30W (2x15W) Dolby Audio",
        Connectivity: "WiFi, Bluetooth 5.0, HDMI x3, USB x2",
        "Refresh Rate": "60 Hz",
      }),
      tags: JSON.stringify(["smart-tv", "android", "4k", "43-inch"]),
    },
    {
      id: 6,
      slug: "dew-plus-55-4k-smart-tv",
      sku: "DP-TV55",
      name: 'Dew Plus 55" 4K UHD Smart TV',
      shortDescription: "55-inch 4K cinematic experience with surround sound",
      description:
        'The Dew Plus 55" 4K Smart TV delivers a cinematic experience with its expansive 55-inch display, HDR10+, Dolby Vision, and 40W surround sound. Features a frameless design and wide color gamut for lifelike visuals.',
      brandId: 2,
      categoryId: 2,
      basePrice: "149900.00",
      salePrice: "134900.00",
      currency: "LKR",
      stockQuantity: 20,
      isInStock: true,
      isFeatured: true,
      isBestSeller: false,
      isNew: true,
      warrantyMonths: 24,
      specifications: JSON.stringify({
        "Screen Size": "55 inches",
        Resolution: "3840 x 2160 4K UHD",
        "Panel Type": "LED (Frameless)",
        OS: "Android TV 13",
        Sound: "40W (2x20W) Dolby Atmos",
        Connectivity: "WiFi 6, Bluetooth 5.1, HDMI x4, USB x3",
        "Refresh Rate": "120 Hz",
      }),
      tags: JSON.stringify(["smart-tv", "android", "4k", "55-inch", "premium"]),
    },
    // DEW+ AC - Air Conditioners
    {
      id: 7,
      slug: "dew-plus-ac-1ton-inverter",
      sku: "DA-1T-INV",
      name: "DEW+ 1 Ton Inverter Split AC",
      shortDescription: "Energy-efficient 1 Ton inverter AC with R32 gas",
      description:
        "The DEW+ 1 Ton Inverter Split AC is perfect for rooms up to 120 sq ft. Features R32 eco-friendly refrigerant, 5-star energy rating, turbo cooling mode, sleep mode, auto-restart, and WiFi smart control via mobile app.",
      brandId: 3,
      categoryId: 3,
      basePrice: "135000.00",
      salePrice: "124900.00",
      currency: "LKR",
      stockQuantity: 45,
      isInStock: true,
      isFeatured: true,
      isBestSeller: true,
      isNew: false,
      warrantyMonths: 12,
      specifications: JSON.stringify({
        Capacity: "1 Ton (12000 BTU)",
        Type: "Inverter Split",
        Refrigerant: "R32 Eco-Friendly",
        "Energy Rating": "5 Star",
        "Cooling Area": "Up to 120 sq ft",
        Features: "Turbo Cool, Sleep Mode, Auto Restart, WiFi",
        "Compressor Warranty": "5 Years",
        Noise: "22 dB (Indoor)",
      }),
      tags: JSON.stringify(["ac", "inverter", "1-ton", "energy-efficient"]),
    },
    {
      id: 8,
      slug: "dew-plus-ac-1-5ton-inverter",
      sku: "DA-1.5T-INV",
      name: "DEW+ 1.5 Ton Inverter Split AC",
      shortDescription: "Powerful 1.5 Ton inverter AC for medium rooms",
      description:
        "The DEW+ 1.5 Ton Inverter AC delivers powerful cooling for medium-sized rooms up to 180 sq ft. With 4D air swing, anti-bacterial filter, self-cleaning function, and smart WiFi control.",
      brandId: 3,
      categoryId: 3,
      basePrice: "175000.00",
      salePrice: "159900.00",
      currency: "LKR",
      stockQuantity: 35,
      isInStock: true,
      isFeatured: true,
      isBestSeller: false,
      isNew: false,
      warrantyMonths: 12,
      specifications: JSON.stringify({
        Capacity: "1.5 Ton (18000 BTU)",
        Type: "Inverter Split",
        Refrigerant: "R32",
        "Energy Rating": "5 Star",
        "Cooling Area": "Up to 180 sq ft",
        Features: "4D Swing, Anti-bacterial Filter, Self-Clean, WiFi",
        "Compressor Warranty": "5 Years",
        Noise: "24 dB (Indoor)",
      }),
      tags: JSON.stringify(["ac", "inverter", "1.5-ton"]),
    },
    {
      id: 9,
      slug: "dew-plus-ac-2ton-inverter",
      sku: "DA-2T-INV",
      name: "DEW+ 2 Ton Inverter Split AC",
      shortDescription: "Heavy-duty 2 Ton inverter AC for large spaces",
      description:
        "The DEW+ 2 Ton Inverter AC is designed for large rooms and commercial spaces up to 250 sq ft. Features rapid cooling, dual-stage filtration, and industry-leading energy efficiency.",
      brandId: 3,
      categoryId: 3,
      basePrice: "225000.00",
      salePrice: "209900.00",
      currency: "LKR",
      stockQuantity: 20,
      isInStock: true,
      isFeatured: false,
      isBestSeller: false,
      isNew: true,
      warrantyMonths: 12,
      specifications: JSON.stringify({
        Capacity: "2 Ton (24000 BTU)",
        Type: "Inverter Split",
        Refrigerant: "R32",
        "Energy Rating": "4 Star",
        "Cooling Area": "Up to 250 sq ft",
        Features: "Rapid Cool, Dual Filter, Self-Clean, WiFi",
        "Compressor Warranty": "5 Years",
        Noise: "28 dB (Indoor)",
      }),
      tags: JSON.stringify(["ac", "inverter", "2-ton", "commercial"]),
    },
    // Manju Dew Super - Water Filters
    {
      id: 10,
      slug: "manju-dew-super-ro-purifier",
      sku: "MDS-RO",
      name: "Manju Dew Super RO Water Purifier",
      shortDescription: "7-stage RO water purifier with mineral enrichment",
      description:
        "The Manju Dew Super RO Purifier uses advanced 7-stage RO+UV+UF filtration to remove 99.9% of impurities while retaining essential minerals. Features a 10L storage tank, filter change indicator, and child lock.",
      brandId: 4,
      categoryId: 4,
      basePrice: "45000.00",
      salePrice: "39900.00",
      currency: "LKR",
      stockQuantity: 60,
      isInStock: true,
      isFeatured: true,
      isBestSeller: true,
      isNew: false,
      warrantyMonths: 12,
      specifications: JSON.stringify({
        Technology: "RO + UV + UF",
        Stages: "7-Stage Filtration",
        Capacity: "10 Liters",
        "Purification Rate": "15 L/hour",
        "TDS Removal": "Up to 2000 ppm",
        Features: "Mineral Enrichment, Filter Indicator, Child Lock",
        "Filter Life": "6-12 months",
      }),
      tags: JSON.stringify(["water-filter", "ro", "purifier"]),
    },
    {
      id: 11,
      slug: "manju-dew-super-hot-cold-dispenser",
      sku: "MDS-HC",
      name: "Manju Dew Super Hot & Cold Dispenser",
      shortDescription: "RO purifier with hot and cold water dispenser",
      description:
        "The Manju Dew Super Hot & Cold Dispenser combines RO purification with instant hot and cold water dispensing. Perfect for offices and homes. Features touchscreen controls and energy-saving mode.",
      brandId: 4,
      categoryId: 4,
      basePrice: "65000.00",
      salePrice: "58900.00",
      currency: "LKR",
      stockQuantity: 25,
      isInStock: true,
      isFeatured: true,
      isBestSeller: false,
      isNew: true,
      warrantyMonths: 12,
      specifications: JSON.stringify({
        Technology: "RO + UV + UF",
        Stages: "8-Stage Filtration",
        "Hot Water": "85-95°C",
        "Cold Water": "5-10°C",
        Capacity: "12 Liters",
        Features: "Touchscreen, Energy Saver, Child Lock",
        "Filter Life": "6-12 months",
      }),
      tags: JSON.stringify(["water-filter", "hot-cold", "dispenser"]),
    },
    // Manju Exercise Books
    {
      id: 12,
      slug: "manju-cr-200-pages",
      sku: "MEB-CR200",
      name: "Manju CR 200 Pages Exercise Book",
      shortDescription: "200-page CR ruled exercise book for students",
      description:
        "Premium quality 200-page CR ruled exercise book made from high-quality paper. Durable cover, smooth writing surface, and consistent ruling. Ideal for students from grade 6 onwards.",
      brandId: 5,
      categoryId: 5,
      basePrice: "180.00",
      salePrice: null,
      currency: "LKR",
      stockQuantity: 5000,
      isInStock: true,
      isFeatured: true,
      isBestSeller: true,
      isNew: false,
      warrantyMonths: 0,
      specifications: JSON.stringify({
        Pages: "200",
        Ruling: "CR (Close Ruled)",
        Size: "A4",
        Paper: "70 GSM Woodfree",
        Cover: "Glossy Art Board",
      }),
      tags: JSON.stringify(["exercise-book", "school", "stationery"]),
    },
    {
      id: 13,
      slug: "manju-single-ruled-120-pages",
      sku: "MEB-SR120",
      name: "Manju Single Ruled 120 Pages",
      shortDescription: "120-page single ruled exercise book",
      description:
        "Standard 120-page single ruled exercise book, perfect for primary and secondary school students. Quality paper prevents ink bleeding.",
      brandId: 5,
      categoryId: 5,
      basePrice: "120.00",
      salePrice: null,
      currency: "LKR",
      stockQuantity: 8000,
      isInStock: true,
      isFeatured: false,
      isBestSeller: true,
      isNew: false,
      warrantyMonths: 0,
      specifications: JSON.stringify({
        Pages: "120",
        Ruling: "Single Ruled",
        Size: "A4",
        Paper: "60 GSM",
        Cover: "Card Board",
      }),
      tags: JSON.stringify(["exercise-book", "school", "stationery"]),
    },
    {
      id: 14,
      slug: "manju-square-ruled-80-pages",
      sku: "MEB-SQ80",
      name: "Manju Square Ruled 80 Pages",
      shortDescription: "80-page square ruled book for math and science",
      description:
        "80-page square ruled exercise book ideal for mathematics, science diagrams, and technical drawings. Grid pattern helps maintain neat work.",
      brandId: 5,
      categoryId: 5,
      basePrice: "95.00",
      salePrice: null,
      currency: "LKR",
      stockQuantity: 6000,
      isInStock: true,
      isFeatured: false,
      isBestSeller: false,
      isNew: false,
      warrantyMonths: 0,
      specifications: JSON.stringify({
        Pages: "80",
        Ruling: "Square (1cm x 1cm)",
        Size: "A4",
        Paper: "60 GSM",
        Cover: "Card Board",
      }),
      tags: JSON.stringify(["exercise-book", "math", "stationery"]),
    },
    {
      id: 15,
      slug: "manju-drawing-book-40-pages",
      sku: "MEB-DR40",
      name: "Manju Drawing Book 40 Pages",
      shortDescription: "40-page unruled drawing book for art class",
      description:
        "Premium 40-page drawing book with thick, unruled white paper suitable for pencil, crayon, and watercolor work. Ideal for art classes and creative activities.",
      brandId: 5,
      categoryId: 5,
      basePrice: "150.00",
      salePrice: "130.00",
      currency: "LKR",
      stockQuantity: 3000,
      isInStock: true,
      isFeatured: false,
      isBestSeller: false,
      isNew: true,
      warrantyMonths: 0,
      specifications: JSON.stringify({
        Pages: "40",
        Ruling: "Unruled",
        Size: "A4",
        Paper: "120 GSM Cartridge",
        Cover: "Glossy Art Board",
      }),
      tags: JSON.stringify(["drawing-book", "art", "stationery"]),
    },
  ];

  for (const p of productData) {
    await db.insert(products).values(p as any);
  }

  // ─── Product Images ───────────────────────────────────────────────────
  console.log("🖼️  Seeding product images...");
  const imageData = [
    {
      productId: 1,
      url: "/scooter_red.png",
      altText: "Dew EM005 2400W Electric Bike",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 2,
      url: "/scooter_silver.png",
      altText: "Dew YW06 2000W Electric Bike",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 3,
      url: "/scooter_red.png",
      altText: "Dew EM003 Electric Scooter",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 4,
      url: "/dew_plus_32_tv.png",
      altText: 'Dew Plus 32" Smart TV',
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 5,
      url: "/dew_plus_43_tv.png",
      altText: 'Dew Plus 43" 4K TV',
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 6,
      url: "/dew_plus_55_tv.png",
      altText: 'Dew Plus 55" 4K TV',
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 7,
      url: "/dew_plus_ac_1ton.png",
      altText: "DEW+ 1 Ton AC",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 8,
      url: "/dew_plus_ac_1_5ton.png",
      altText: "DEW+ 1.5 Ton AC",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 9,
      url: "/dew_plus_ac_2ton.png",
      altText: "DEW+ 2 Ton AC",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 10,
      url: "/ro_water_purifier.png",
      altText: "Manju Dew Super RO Purifier",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 11,
      url: "/ro_water_purifier.png",
      altText: "Manju Dew Super Hot & Cold",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 12,
      url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=85",
      altText: "Manju CR 200 Pages",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 13,
      url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=85",
      altText: "Manju Single Ruled 120 Pages",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 14,
      url: "https://images.unsplash.com/photo-1519406596751-0a3ccc4937ef?auto=format&fit=crop&w=800&q=85",
      altText: "Manju Square Ruled 80 Pages",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      productId: 15,
      url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=85",
      altText: "Manju Drawing Book 40 Pages",
      isPrimary: true,
      sortOrder: 0,
    },
  ];
  for (const img of imageData) {
    await db.insert(productImages).values(img);
  }

  // ─── Product Variants ─────────────────────────────────────────────────
  console.log("🔀 Seeding product variants...");
  await db.insert(productVariants).values([
    {
      productId: 1,
      sku: "DM-EM005-BLK",
      name: "Matte Black",
      price: "449000.00",
      stockQuantity: 15,
      isActive: true,
    },
    {
      productId: 1,
      sku: "DM-EM005-WHT",
      name: "Pearl White",
      price: "449000.00",
      stockQuantity: 10,
      isActive: true,
    },
    {
      productId: 2,
      sku: "DM-YW06-RED",
      name: "Racing Red",
      price: "339000.00",
      stockQuantity: 20,
      isActive: true,
    },
    {
      productId: 2,
      sku: "DM-YW06-BLU",
      name: "Ocean Blue",
      price: "339000.00",
      stockQuantity: 20,
      isActive: true,
    },
    {
      productId: 7,
      sku: "DA-1T-INV-WHT",
      name: "White",
      price: "124900.00",
      stockQuantity: 25,
      isActive: true,
    },
    {
      productId: 8,
      sku: "DA-1.5T-INV-WHT",
      name: "White",
      price: "159900.00",
      stockQuantity: 20,
      isActive: true,
    },
    {
      productId: 9,
      sku: "DA-2T-INV-WHT",
      name: "White",
      price: "209900.00",
      stockQuantity: 15,
      isActive: true,
    },
  ]);

  // ─── Locations ────────────────────────────────────────────────────────
  console.log("📍 Seeding locations...");
  await db.insert(locations).values([
    {
      name: "Manju Group Head Office & Showroom - Colombo",
      type: "showroom",
      address: "No. 45, Galle Road, Colombo 03",
      city: "Colombo",
      province: "Western",
      phone: "+94 11 234 5678",
      email: "colombo@manjugroup.lk",
      latitude: "6.9170000",
      longitude: "79.8480000",
      openingHours: JSON.stringify({
        Monday: "9:00 AM - 6:00 PM",
        Tuesday: "9:00 AM - 6:00 PM",
        Wednesday: "9:00 AM - 6:00 PM",
        Thursday: "9:00 AM - 6:00 PM",
        Friday: "9:00 AM - 6:00 PM",
        Saturday: "9:00 AM - 4:00 PM",
        Sunday: "Closed",
      }),
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Manju Group Showroom - Kandy",
      type: "showroom",
      address: "No. 78, Peradeniya Road, Kandy",
      city: "Kandy",
      province: "Central",
      phone: "+94 81 234 5678",
      email: "kandy@manjugroup.lk",
      latitude: "7.2906000",
      longitude: "80.6337000",
      openingHours: JSON.stringify({
        Monday: "9:00 AM - 6:00 PM",
        Tuesday: "9:00 AM - 6:00 PM",
        Wednesday: "9:00 AM - 6:00 PM",
        Thursday: "9:00 AM - 6:00 PM",
        Friday: "9:00 AM - 6:00 PM",
        Saturday: "9:00 AM - 4:00 PM",
        Sunday: "Closed",
      }),
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Manju Group Showroom - Galle",
      type: "showroom",
      address: "No. 12, Main Street, Galle",
      city: "Galle",
      province: "Southern",
      phone: "+94 91 234 5678",
      email: "galle@manjugroup.lk",
      latitude: "6.0535000",
      longitude: "80.2210000",
      openingHours: JSON.stringify({
        Monday: "9:00 AM - 5:30 PM",
        Tuesday: "9:00 AM - 5:30 PM",
        Wednesday: "9:00 AM - 5:30 PM",
        Thursday: "9:00 AM - 5:30 PM",
        Friday: "9:00 AM - 5:30 PM",
        Saturday: "9:00 AM - 3:00 PM",
        Sunday: "Closed",
      }),
      isActive: true,
      sortOrder: 3,
    },
    {
      name: "Manju Group Showroom - Kurunegala",
      type: "showroom",
      address: "No. 56, Colombo Road, Kurunegala",
      city: "Kurunegala",
      province: "North Western",
      phone: "+94 37 234 5678",
      email: "kurunegala@manjugroup.lk",
      latitude: "7.4867000",
      longitude: "80.3647000",
      openingHours: JSON.stringify({
        Monday: "9:00 AM - 5:30 PM",
        Tuesday: "9:00 AM - 5:30 PM",
        Wednesday: "9:00 AM - 5:30 PM",
        Thursday: "9:00 AM - 5:30 PM",
        Friday: "9:00 AM - 5:30 PM",
        Saturday: "9:00 AM - 3:00 PM",
        Sunday: "Closed",
      }),
      isActive: true,
      sortOrder: 4,
    },
    {
      name: "Manju Group Showroom - Jaffna",
      type: "showroom",
      address: "No. 23, Hospital Road, Jaffna",
      city: "Jaffna",
      province: "Northern",
      phone: "+94 21 234 5678",
      email: "jaffna@manjugroup.lk",
      latitude: "9.6615000",
      longitude: "80.0255000",
      openingHours: JSON.stringify({
        Monday: "9:00 AM - 5:30 PM",
        Tuesday: "9:00 AM - 5:30 PM",
        Wednesday: "9:00 AM - 5:30 PM",
        Thursday: "9:00 AM - 5:30 PM",
        Friday: "9:00 AM - 5:30 PM",
        Saturday: "9:00 AM - 2:00 PM",
        Sunday: "Closed",
      }),
      isActive: true,
      sortOrder: 5,
    },
    {
      name: "Manju Group Service Center - Matara",
      type: "service_center",
      address: "No. 89, Station Road, Matara",
      city: "Matara",
      province: "Southern",
      phone: "+94 41 234 5678",
      email: "matara@manjugroup.lk",
      latitude: "5.9549000",
      longitude: "80.5350000",
      openingHours: JSON.stringify({
        Monday: "8:30 AM - 5:00 PM",
        Tuesday: "8:30 AM - 5:00 PM",
        Wednesday: "8:30 AM - 5:00 PM",
        Thursday: "8:30 AM - 5:00 PM",
        Friday: "8:30 AM - 5:00 PM",
        Saturday: "8:30 AM - 1:00 PM",
        Sunday: "Closed",
      }),
      isActive: true,
      sortOrder: 6,
    },
    {
      name: "Manju Group Showroom - Anuradhapura",
      type: "showroom",
      address: "No. 34, Main Street, Anuradhapura",
      city: "Anuradhapura",
      province: "North Central",
      phone: "+94 25 234 5678",
      email: "anuradhapura@manjugroup.lk",
      latitude: "8.3114000",
      longitude: "80.4037000",
      openingHours: JSON.stringify({
        Monday: "9:00 AM - 5:30 PM",
        Tuesday: "9:00 AM - 5:30 PM",
        Wednesday: "9:00 AM - 5:30 PM",
        Thursday: "9:00 AM - 5:30 PM",
        Friday: "9:00 AM - 5:30 PM",
        Saturday: "9:00 AM - 2:00 PM",
        Sunday: "Closed",
      }),
      isActive: true,
      sortOrder: 7,
    },
    {
      name: "Manju Group Showroom - Negombo",
      type: "showroom",
      address: "No. 67, Colombo Road, Negombo",
      city: "Negombo",
      province: "Western",
      phone: "+94 31 234 5678",
      email: "negombo@manjugroup.lk",
      latitude: "7.2008000",
      longitude: "79.8737000",
      openingHours: JSON.stringify({
        Monday: "9:00 AM - 6:00 PM",
        Tuesday: "9:00 AM - 6:00 PM",
        Wednesday: "9:00 AM - 6:00 PM",
        Thursday: "9:00 AM - 6:00 PM",
        Friday: "9:00 AM - 6:00 PM",
        Saturday: "9:00 AM - 4:00 PM",
        Sunday: "Closed",
      }),
      isActive: true,
      sortOrder: 8,
    },
  ]);

  // ─── FAQs ─────────────────────────────────────────────────────────────
  console.log("❓ Seeding FAQs...");
  await db.insert(faqs).values([
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept Cash on Delivery (COD), bank transfers, credit/debit cards (Visa, MasterCard, Amex), and PayHere online payment gateway. For bulk orders, we also accept cheque payments.",
      category: "Payment",
      sortOrder: 1,
      isActive: true,
    },
    {
      question: "Do you offer island-wide delivery?",
      answer:
        "Yes! We deliver across all districts in Sri Lanka. Delivery is free for orders above LKR 10,000. For smaller orders, a flat delivery fee of LKR 500 applies. Delivery typically takes 3-5 business days.",
      category: "Delivery",
      sortOrder: 2,
      isActive: true,
    },
    {
      question: "What is the warranty policy for Dew Motors electric bikes?",
      answer:
        "All Dew Motors electric bikes come with a 12-month comprehensive warranty covering the motor, controller, and electrical components. The battery has a separate 12-month warranty. Extended warranty packages are available for purchase.",
      category: "Warranty",
      sortOrder: 3,
      isActive: true,
    },
    {
      question: "Do DEW+ Air Conditioners come with free installation?",
      answer:
        "Yes! All DEW+ AC units include free standard installation (up to 10 feet piping) within Colombo district. For other areas, installation is available at a nominal charge. Our certified technicians ensure proper setup.",
      category: "Products",
      sortOrder: 4,
      isActive: true,
    },
    {
      question:
        "How often should I replace the water filter in Manju Dew Super purifiers?",
      answer:
        "We recommend replacing the sediment filter every 3-6 months and the RO membrane every 12-18 months, depending on water quality and usage. The filter change indicator on the unit will remind you when it's time.",
      category: "Products",
      sortOrder: 5,
      isActive: true,
    },
    {
      question: "Can I track my order?",
      answer:
        "Yes, once your order is shipped, you will receive an SMS and email with a tracking number. You can track your delivery status on our website or contact our customer support team.",
      category: "Delivery",
      sortOrder: 6,
      isActive: true,
    },
    {
      question: "What is your return and exchange policy?",
      answer:
        "We offer a 7-day return/exchange policy for unused, unopened products in original packaging. For defective products, we provide free replacement or repair under warranty. Contact our support team to initiate a return.",
      category: "General",
      sortOrder: 7,
      isActive: true,
    },
    {
      question: "Are Dew Plus Smart TVs covered by warranty?",
      answer:
        "Yes, all Dew Plus Smart TVs come with a 24-month manufacturer warranty covering all hardware defects. Panel warranty is included. Software issues are supported through OTA updates.",
      category: "Warranty",
      sortOrder: 8,
      isActive: true,
    },
    {
      question: "Where can I find a Manju Group showroom near me?",
      answer:
        "We have showrooms and service centers across Sri Lanka including Colombo, Kandy, Galle, Kurunegala, Jaffna, Matara, Anuradhapura, and Negombo. Visit our Locations page for addresses, phone numbers, and directions.",
      category: "General",
      sortOrder: 9,
      isActive: true,
    },
    {
      question: "Do you offer bulk pricing for Manju Exercise Books?",
      answer:
        "Yes! We offer special bulk pricing for schools, bookshops, and distributors. Contact our sales team at sales@manjugroup.lk or call +94 11 234 5678 for a customized quote.",
      category: "Products",
      sortOrder: 10,
      isActive: true,
    },
  ]);

  // ─── Blog Posts ────────────────────────────────────────────────────────
  console.log("📝 Seeding blog posts...");
  await db.insert(blogPosts).values([
    {
      slug: "dew-motors-launches-em005-2400w",
      title: "Dew Motors Launches the All-New EM005 2400W Electric Bike",
      excerpt:
        "The most powerful electric bike in Sri Lanka is here. Meet the Dew EM005 with 2400W motor and 80km range.",
      content:
        "We are thrilled to announce the launch of the Dew EM005, our most powerful electric motorcycle yet. Featuring a robust 2400W hub motor and a high-capacity 72V 32Ah lithium battery, the EM005 delivers an impressive 80km range on a single charge.\n\nDesigned for the Sri Lankan commuter, this electric bike combines power, efficiency, and style. With a top speed of 70 km/h, dual disc brakes, LED lighting system, and a comprehensive digital dashboard, the EM005 sets a new standard for electric mobility in South Asia.\n\nKey highlights:\n- 2400W powerful hub motor\n- 80 km range per charge\n- 4-5 hour fast charging\n- Digital speedometer and battery indicator\n- Anti-theft alarm system\n- 12-month comprehensive warranty\n\nAvailable now at all Manju Group showrooms across Sri Lanka. Test ride available at our Colombo and Kandy locations.",
      authorName: "Manju Group Team",
      category: "Product Launch",
      isPublished: true,
      publishedAt: new Date("2024-12-15"),
    },
    {
      slug: "manju-group-expands-to-jaffna",
      title: "Manju Group Opens New Showroom in Jaffna",
      excerpt:
        "Expanding our presence in the Northern Province with a brand new showroom featuring all five brands.",
      content:
        "Manju Group is excited to announce the opening of our newest showroom in Jaffna, bringing our complete range of products to the Northern Province.\n\nThe new showroom, located on Hospital Road, features dedicated display areas for all five Manju Group brands: Dew Motors electric bikes, Dew Plus Smart TVs, DEW+ Air Conditioners, Manju Dew Super water purifiers, and Manju Exercise Books.\n\nCustomers in Jaffna can now experience our products firsthand, enjoy test rides on Dew Motors electric bikes, and benefit from our after-sales service center.\n\nGrand opening offers include:\n- 10% discount on all products\n- Free installation for AC units\n- Extended warranty packages at special prices\n\nVisit us at No. 23, Hospital Road, Jaffna. Open Monday to Saturday.",
      authorName: "Manju Group Team",
      category: "Company News",
      isPublished: true,
      publishedAt: new Date("2025-01-20"),
    },
    {
      slug: "why-switch-to-electric-bikes-sri-lanka",
      title: "5 Reasons Why Sri Lankans Should Switch to Electric Bikes",
      excerpt:
        "Discover how electric bikes can save you money, reduce pollution, and provide a better riding experience.",
      content:
        "With rising fuel costs and growing environmental concerns, electric bikes are becoming an increasingly attractive option for Sri Lankan commuters. Here are five compelling reasons to make the switch:\n\n1. **Massive Cost Savings**: An electric bike costs approximately LKR 2-3 per kilometer to operate, compared to LKR 15-20 for a petrol motorcycle. Over a year, you could save over LKR 100,000.\n\n2. **Zero Emissions**: Electric bikes produce zero direct emissions, helping reduce air pollution in our cities. Sri Lanka can benefit greatly from cleaner transportation.\n\n3. **Low Maintenance**: No oil changes, no spark plugs, no fuel filters. Electric motors have far fewer moving parts, reducing maintenance costs by up to 70%.\n\n4. **Quiet Operation**: Enjoy a smooth, quiet ride through your neighborhood without disturbing others. No more loud engine noise.\n\n5. **Government Incentives**: Sri Lanka offers reduced import duties on electric vehicles, making them more affordable than ever.\n\nExplore our range of Dew Motors electric bikes, starting from LKR 245,000.",
      authorName: "Manju Group Team",
      category: "Tips & Guides",
      isPublished: true,
      publishedAt: new Date("2025-03-10"),
    },
    {
      slug: "dew-plus-smart-tv-4k-lineup-2025",
      title: "Dew Plus Unveils 2025 4K Smart TV Lineup with Android TV 13",
      excerpt:
        'New 43" and 55" models feature HDR10+, Dolby Atmos, and the latest Android TV experience.',
      content:
        'Dew Plus is proud to introduce our enhanced 2025 Smart TV lineup, featuring the latest Android TV 13 platform across our 43" and 55" 4K UHD models.\n\nThe new range brings significant upgrades including:\n- HDR10+ and Dolby Vision support for stunning visuals\n- Dolby Atmos certified sound systems\n- Google TV integration with personalized recommendations\n- Voice control via Google Assistant\n- WiFi 6 connectivity for seamless streaming\n\nPricing starts at LKR 79,900 for the 43" model and LKR 134,900 for the premium 55" frameless model.\n\nAvailable at all Manju Group showrooms. Special launch offers include free wall mounting and a 6-month extended warranty.',
      authorName: "Manju Group Team",
      category: "Product Launch",
      isPublished: true,
      publishedAt: new Date("2025-05-01"),
    },
    {
      slug: "water-purification-guide-sri-lanka",
      title: "A Complete Guide to Water Purification for Sri Lankan Homes",
      excerpt:
        "Understanding water quality issues in Sri Lanka and choosing the right purification system for your family.",
      content:
        "Clean drinking water is essential for every Sri Lankan family. With varying water quality across different regions, choosing the right purification system is crucial.\n\n**Understanding Water Quality in Sri Lanka:**\nMany areas in Sri Lanka face challenges with hard water, bacterial contamination, and elevated TDS levels. Regions like the North Central and North Western provinces particularly need robust purification.\n\n**Types of Purification:**\n- **RO (Reverse Osmosis)**: Best for high TDS water, removes dissolved salts and heavy metals\n- **UV (Ultraviolet)**: Kills bacteria and viruses, ideal for low TDS water\n- **UF (Ultrafiltration)**: Physical filtration for particles and bacteria\n\n**Our Recommendation:**\nThe Manju Dew Super RO water purifiers combine all three technologies (RO+UV+UF) for comprehensive purification, ensuring your family gets clean, mineral-rich water.\n\nStarting from just LKR 39,900, our purifiers are an affordable investment in your family's health.",
      authorName: "Manju Group Team",
      category: "Tips & Guides",
      isPublished: true,
      publishedAt: new Date("2025-06-15"),
    },
  ]);

  // ─── Banners ──────────────────────────────────────────────────────────
  console.log("🎨 Seeding banners...");
  await db.insert(banners).values([
    {
      title: "Dew Motors Electric Bikes",
      subtitle: "Power Your Ride. Starting from LKR 245,000",
      linkUrl: "/brands/dew-motors",
      linkText: "Explore Now",
      placement: "hero",
      bgColor: "#0c1a2e",
      textColor: "#ffffff",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Dew Plus 4K Smart TVs",
      subtitle: "Crystal Clear Entertainment for Every Home",
      linkUrl: "/brands/dew-plus",
      linkText: "Shop Smart TVs",
      placement: "hero",
      bgColor: "#1e1b4b",
      textColor: "#ffffff",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "DEW+ AC - Beat the Heat",
      subtitle: "Energy-efficient inverter ACs with free installation",
      linkUrl: "/brands/dew-plus-ac",
      linkText: "Stay Cool",
      placement: "hero",
      bgColor: "#083344",
      textColor: "#ffffff",
      sortOrder: 3,
      isActive: true,
    },
  ]);

  console.log("✅ Seed completed successfully!");
  console.log("   - 5 Brands");
  console.log("   - 5 Categories");
  console.log("   - 15 Products with images and variants");
  console.log("   - 8 Locations");
  console.log("   - 10 FAQs");
  console.log("   - 5 Blog Posts");
  console.log("   - 3 Hero Banners");

  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
