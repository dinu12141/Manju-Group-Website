import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { products, productImages } from "../drizzle/schema";

const WATER_FILTER_PRODUCTS = [
  {
    slug: "dew-super-ro-plus-water-filter",
    sku: "MNJ-04-04-039",
    name: "Dew Super RO+ Water Filter",
    shortDescription: "One year warranty",
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\nEasy payment methods in installments\nFree water testing",
    basePrice: "74900.00",
    warrantyMonths: 24,
    specifications: {
      "01. Stage": "05 Micron Sediment Filter",
      "02. Stage": "01 Micron Sediment Filter",
      "03. Stage": "Activated Carbon Filter",
      "04. Stage": "RO Membrane",
      "05. Stage": "Mineral Cartridge",
      "06. Stage": "UV Sterilizer",
      "Sub Category": "RO+ Water Filter",
      Capacity: "100 liters per day",
    },
    image: "/dew_super_ro_plus.webp",
  },
  {
    slug: "dew-super-hot-normal-water-filter",
    sku: "MNJ-04-04-040",
    name: "Dew Super Hot & Normal Water Filter",
    shortDescription: "One year warranty",
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\nEasy payment methods in installments\nFree water testing",
    basePrice: "86900.00",
    warrantyMonths: 24,
    specifications: {
      "01. Stage": "05 Micron Sediment Filter",
      "02. Stage": "01 Micron Sediment Filter",
      "03. Stage": "Activated Carbon Filter",
      "04. Stage": "RO Membrane",
      "05. Stage": "Mineral Cartridge",
      "06. Stage": "UV Sterilizer",
      "Sub Category": "Hot & Normal Water Filter",
      Capacity: "75 liters per day",
    },
    image: "/dew_super_hot_normal.webp",
  },
  {
    slug: "dew-super-hotcool-normal-water-filter",
    sku: "MNJ-04-04-041",
    name: "Dew Super Hot, Cool & Normal Water Filter",
    shortDescription: "One year warranty",
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\nEasy payment methods in installments\nFree water testing",
    basePrice: "89900.00",
    warrantyMonths: 24,
    isBestSeller: true,
    specifications: {
      "01. Stage": "05 Micron Sediment Filter",
      "02. Stage": "01 Micron Sediment Filter",
      "03. Stage": "Activated Carbon Filter",
      "04. Stage": "RO Membrane",
      "05. Stage": "Mineral Cartridge",
      "06. Stage": "UV Sterilizer",
      "Sub Category": "Hot, Cool & Normal Water Filter",
      Capacity: "75 liters per day",
    },
    image: "/dew_super_hot_cold_dispenser.webp",
  },
  {
    slug: "dew-super-commercial-water-filter-500l",
    sku: "MNJ-04-04-042",
    name: "Dew Super Commercial Water Filter 500L",
    shortDescription: "One year warranty",
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\nEasy payment methods in installments\nFree water testing",
    basePrice: "175000.00",
    warrantyMonths: 24,
    specifications: {
      "01. Stage": "05 Micron Sediment Filter",
      "02. Stage": "01 Micron Sediment Filter",
      "03. Stage": "Activated Carbon Filter",
      "04. Stage": "RO Membrane",
      "05. Stage": "Mineral Cartridge",
      "06. Stage": "UV Sterilizer",
      "Sub Category": "Commercial Water Filter",
      Capacity: "500 liters per day",
    },
    image: "/dew_super_commercial_500l.webp",
  },
  {
    slug: "dew-super-commercial-water-filter-2500l",
    sku: "MNJ-04-04-043",
    name: "Dew Super Commercial Water Filter 2500L",
    shortDescription: "One year warranty",
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\nEasy payment methods in installments\nFree water testing",
    basePrice: "315000.00",
    warrantyMonths: 24,
    specifications: {
      "01. Stage": "05 Micron Sediment Filter",
      "02. Stage": "01 Micron Sediment Filter",
      "03. Stage": "Activated Carbon Filter",
      "04. Stage": "RO Membrane",
      "05. Stage": "Mineral Cartridge",
      "06. Stage": "UV Sterilizer",
      "Sub Category": "Commercial Water Filter",
      Capacity: "2500 liters per day",
    },
    image: "/dew_super_commercial_2500l.webp",
  },
  {
    slug: "dew-super-commercial-water-filter-3000l",
    sku: "MNJ-04-04-044",
    name: "Dew Super Commercial Water Filter 3000L",
    shortDescription: "One year warranty",
    description:
      "One year warranty\nLong term maintenance service after warranty period\nFree shipping and installation\nFree water test\nFree after sale service\nAvailability of all spare parts\nEasy payment methods in installments\nFree water testing",
    basePrice: "400000.00",
    warrantyMonths: 24,
    specifications: {
      "01. Stage": "05 Micron Sediment Filter",
      "02. Stage": "01 Micron Sediment Filter",
      "03. Stage": "Activated Carbon Filter",
      "04. Stage": "RO Membrane",
      "05. Stage": "Mineral Cartridge",
      "06. Stage": "UV Sterilizer",
      "Sub Category": "Commercial Water Filter",
      Capacity: "3000 liters per day",
    },
    image: "/dew_super_commercial_3000l.webp",
  },
];

const BRAND_ID = 4; // manju-dew-super
const CATEGORY_ID = 4; // water-filters

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const db = drizzle(dbUrl);

  for (const p of WATER_FILTER_PRODUCTS) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, p.slug))
      .limit(1);

    if (existing) {
      console.log(`skip (exists): ${p.slug}`);
      continue;
    }

    const [result] = await db.insert(products).values({
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      brandId: BRAND_ID,
      categoryId: CATEGORY_ID,
      basePrice: p.basePrice,
      currency: "LKR",
      stockQuantity: 20,
      isInStock: true,
      isFeatured: false,
      isBestSeller: p.isBestSeller ?? false,
      isNew: false,
      warrantyMonths: p.warrantyMonths,
      specifications: p.specifications,
    });

    const insertedId = (result as any).insertId as number;

    await db.insert(productImages).values({
      productId: insertedId,
      url: p.image,
      altText: p.name,
      isPrimary: true,
      sortOrder: 0,
    });

    console.log(`inserted: ${p.slug} (id ${insertedId})`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
