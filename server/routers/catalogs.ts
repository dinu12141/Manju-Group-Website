import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { siteSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export interface ProductCatalogItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  brand?: string;
  description: string;
  coverImageUrl: string;
  fileUrl: string;
  fileSize?: string;
  fileFormat?: string;
  pageCount?: string;
  year?: string;
  tag?: string;
  downloadCount: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_CATALOGS: ProductCatalogItem[] = [
  {
    id: "catalog-ebikes-2026",
    title: "Manju Electric Bikes & Scooters — 2026 Fleet Catalog",
    subtitle: "Complete Specifications, Range & Lithium Battery Options",
    category: "Electric Bikes",
    brand: "Manju E-Bikes",
    description: "Explore the full 2026 lineup of Manju electric scooters and bikes. Detailed speed curves, 60V-72V lithium pack capacities, regenerative braking specs, and color options.",
    coverImageUrl: "/scooter_red.webp",
    fileUrl: "/catalogs/manju_ebikes_catalog_2026.pdf",
    fileSize: "6.4 MB",
    fileFormat: "PDF",
    pageCount: "28 Pages",
    year: "2026 Edition",
    tag: "NEW 2026",
    downloadCount: 384,
    sortOrder: 1,
    isActive: true,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-09-20T00:00:00.000Z",
  },
  {
    id: "catalog-ac-hvac-2026",
    title: "Super General Inverter Air Conditioners & HVAC Systems",
    subtitle: "High-Efficiency Tropical Inverter Split & Cassette Units",
    category: "Air Conditioners",
    brand: "Super General",
    description: "Official engineering brochure for Super General 9,000 BTU to 24,000 BTU Inverter Air Conditioners with T3 tropical rotary compressors, eco R32 refrigerant, and power savings.",
    coverImageUrl: "/dew_plus_ac_1_5ton.webp",
    fileUrl: "/catalogs/super_general_ac_catalog.pdf",
    fileSize: "5.2 MB",
    fileFormat: "PDF",
    pageCount: "20 Pages",
    year: "2026 Edition",
    tag: "FLAGSHIP",
    downloadCount: 265,
    sortOrder: 2,
    isActive: true,
    createdAt: "2026-01-20T00:00:00.000Z",
    updatedAt: "2026-09-20T00:00:00.000Z",
  },
  {
    id: "catalog-ro-water-2026",
    title: "Pure Drop Domestic & Commercial RO Water Purifiers",
    subtitle: "Multi-Stage Reverse Osmosis & UV Alkaline Systems",
    category: "Water Purification",
    brand: "Pure Drop",
    description: "Comprehensive guide to Pure Drop RO water filtration, hot/cold dispensers, commercial plant membranes, laboratory water quality analysis, and replacement filter specs.",
    coverImageUrl: "/ro_water_purifier.webp",
    fileUrl: "/catalogs/pure_drop_water_catalog.pdf",
    fileSize: "4.8 MB",
    fileFormat: "PDF",
    pageCount: "16 Pages",
    year: "2026 Edition",
    tag: "POPULAR",
    downloadCount: 319,
    sortOrder: 3,
    isActive: true,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-09-20T00:00:00.000Z",
  },
  {
    id: "catalog-solar-power-2026",
    title: "Manju Solar Energy Solutions & Hybrid Inverter Blueprint",
    subtitle: "On-Grid, Off-Grid & LiFePO4 Energy Storage Blueprint",
    category: "Solar & Appliances",
    brand: "Manju Solar",
    description: "Industrial and residential solar installation blueprint: Tier-1 N-Type TOPCon panels, hybrid smart inverters, lithium battery banks, and CEB net-metering approval procedures.",
    coverImageUrl: "/banner_ebike_cinematic.webp",
    fileUrl: "/catalogs/manju_solar_power_catalog.pdf",
    fileSize: "7.1 MB",
    fileFormat: "PDF",
    pageCount: "24 Pages",
    year: "2026 Edition",
    tag: "2026 EDITION",
    downloadCount: 198,
    sortOrder: 4,
    isActive: true,
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-09-20T00:00:00.000Z",
  },
];

async function getStoredCatalogs(db: any): Promise<ProductCatalogItem[]> {
  try {
    const rows = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, "product_catalogs"))
      .limit(1);

    if (rows.length > 0 && Array.isArray(rows[0].value) && rows[0].value.length > 0) {
      return rows[0].value as ProductCatalogItem[];
    }
  } catch (err) {
    console.error("Error reading product_catalogs from site_settings:", err);
  }
  return DEFAULT_CATALOGS;
}

async function saveStoredCatalogs(db: any, catalogs: ProductCatalogItem[]): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key: "product_catalogs", value: catalogs as any })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: catalogs as any, updatedAt: new Date() },
    });
}

export const catalogsRouter = router({
  // ── Public Procedures ───────────────────────────────────────────────────────
  list: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return DEFAULT_CATALOGS.filter(c => c.isActive);

        let list = await getStoredCatalogs(db);
        // Only return published/active catalogs to public
        list = list.filter(c => c.isActive !== false);

        if (input?.category && input.category !== "All" && input.category !== "all") {
          const cat = input.category.toLowerCase().trim();
          list = list.filter(c => c.category.toLowerCase().includes(cat));
        }

        if (input?.search && input.search.trim()) {
          const q = input.search.toLowerCase().trim();
          list = list.filter(
            c =>
              c.title.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q) ||
              c.category.toLowerCase().includes(q) ||
              (c.brand && c.brand.toLowerCase().includes(q)) ||
              (c.subtitle && c.subtitle.toLowerCase().includes(q))
          );
        }

        return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      } catch (err) {
        console.error("Failed to fetch public catalogs:", err);
        return DEFAULT_CATALOGS.filter(c => c.isActive);
      }
    }),

  recordDownload: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: true };

        const list = await getStoredCatalogs(db);
        const index = list.findIndex(c => c.id === input.id);
        if (index >= 0) {
          list[index].downloadCount = (list[index].downloadCount || 0) + 1;
          await saveStoredCatalogs(db, list);
        }
        return { success: true };
      } catch (err) {
        console.error("Failed to increment catalog download:", err);
        return { success: true };
      }
    }),

  // ── Admin Procedures ────────────────────────────────────────────────────────
  adminList: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return DEFAULT_CATALOGS;

      const list = await getStoredCatalogs(db);
      return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    } catch (err: any) {
      console.error("Failed to fetch admin catalogs list:", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Failed to load product catalogs",
      });
    }
  }),

  saveCatalog: adminProcedure
    .input(
      z.object({
        id: z.string().optional(),
        title: z.string().min(2, "Title must be at least 2 characters"),
        subtitle: z.string().optional().nullable(),
        category: z.string().min(2, "Category is required"),
        brand: z.string().optional().nullable(),
        description: z.string().min(5, "Description must be at least 5 characters"),
        coverImageUrl: z.string().min(1, "Cover image URL is required"),
        fileUrl: z.string().min(1, "Document file URL / PDF is required"),
        fileSize: z.string().optional().nullable(),
        fileFormat: z.string().optional().nullable(),
        pageCount: z.string().optional().nullable(),
        year: z.string().optional().nullable(),
        tag: z.string().optional().nullable(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const list = await getStoredCatalogs(db);
        const now = new Date().toISOString();

        if (input.id) {
          const index = list.findIndex(c => c.id === input.id);
          if (index >= 0) {
            list[index] = {
              ...list[index],
              title: input.title.trim(),
              subtitle: input.subtitle?.trim() || undefined,
              category: input.category.trim(),
              brand: input.brand?.trim() || undefined,
              description: input.description.trim(),
              coverImageUrl: input.coverImageUrl.trim(),
              fileUrl: input.fileUrl.trim(),
              fileSize: input.fileSize?.trim() || "PDF",
              fileFormat: input.fileFormat?.trim() || "PDF",
              pageCount: input.pageCount?.trim() || undefined,
              year: input.year?.trim() || "2026 Edition",
              tag: input.tag?.trim() || undefined,
              sortOrder: Number(input.sortOrder) || 0,
              isActive: input.isActive,
              updatedAt: now,
            };
          } else {
            list.push({
              id: input.id,
              title: input.title.trim(),
              subtitle: input.subtitle?.trim() || undefined,
              category: input.category.trim(),
              brand: input.brand?.trim() || undefined,
              description: input.description.trim(),
              coverImageUrl: input.coverImageUrl.trim(),
              fileUrl: input.fileUrl.trim(),
              fileSize: input.fileSize?.trim() || "PDF",
              fileFormat: input.fileFormat?.trim() || "PDF",
              pageCount: input.pageCount?.trim() || undefined,
              year: input.year?.trim() || "2026 Edition",
              tag: input.tag?.trim() || undefined,
              downloadCount: 0,
              sortOrder: Number(input.sortOrder) || 0,
              isActive: input.isActive,
              createdAt: now,
              updatedAt: now,
            });
          }
        } else {
          const newId = `catalog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          list.push({
            id: newId,
            title: input.title.trim(),
            subtitle: input.subtitle?.trim() || undefined,
            category: input.category.trim(),
            brand: input.brand?.trim() || undefined,
            description: input.description.trim(),
            coverImageUrl: input.coverImageUrl.trim(),
            fileUrl: input.fileUrl.trim(),
            fileSize: input.fileSize?.trim() || "PDF",
            fileFormat: input.fileFormat?.trim() || "PDF",
            pageCount: input.pageCount?.trim() || undefined,
            year: input.year?.trim() || "2026 Edition",
            tag: input.tag?.trim() || undefined,
            downloadCount: 0,
            sortOrder: Number(input.sortOrder) || list.length + 1,
            isActive: input.isActive,
            createdAt: now,
            updatedAt: now,
          });
        }

        await saveStoredCatalogs(db, list);
        return { success: true, count: list.length };
      } catch (err: any) {
        console.error("Failed to save catalog:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message || "Failed to save product catalog",
        });
      }
    }),

  deleteCatalog: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        let list = await getStoredCatalogs(db);
        list = list.filter(c => c.id !== input.id);
        await saveStoredCatalogs(db, list);
        return { success: true, count: list.length };
      } catch (err: any) {
        console.error("Failed to delete catalog:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message || "Failed to delete product catalog",
        });
      }
    }),

  toggleCatalogActive: adminProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const list = await getStoredCatalogs(db);
        const item = list.find(c => c.id === input.id);
        if (item) {
          item.isActive = input.isActive;
          item.updatedAt = new Date().toISOString();
          await saveStoredCatalogs(db, list);
        }
        return { success: true, isActive: input.isActive };
      } catch (err: any) {
        console.error("Failed to toggle catalog active:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message || "Failed to toggle status",
        });
      }
    }),

  seedDefaultCatalogs: adminProcedure.mutation(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await saveStoredCatalogs(db, DEFAULT_CATALOGS);
      return { success: true, count: DEFAULT_CATALOGS.length };
    } catch (err: any) {
      console.error("Failed to seed default catalogs:", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Failed to reset default catalogs",
      });
    }
  }),
});
