import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { locations } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

export const locationsRouter = router({
  list: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(locations)
        .where(eq(locations.isActive, true))
        .orderBy(asc(locations.sortOrder), asc(locations.id));

      return rows.map(loc => {
        let formattedHours = "Mon–Sat: 8:30 AM – 6:30 PM";
        if (typeof loc.openingHours === "string") {
          formattedHours = loc.openingHours;
        } else if (loc.openingHours && typeof loc.openingHours === "object") {
          const oh = loc.openingHours as Record<string, string>;
          if (oh.Monday && oh.Sunday) {
            formattedHours = `Mon–Sat: ${oh.Monday} | Sun: ${oh.Sunday}`;
          } else if (oh.summary) {
            formattedHours = String(oh.summary);
          } else {
            formattedHours = Object.entries(oh)
              .map(([k, v]) => `${k}: ${v}`)
              .slice(0, 2)
              .join(" | ");
          }
        }

        const servicesList = Array.isArray(loc.services)
          ? (loc.services as string[])
          : [
              "All 4 Core Brands Showcase",
              "Water Test Lab & Installations",
              "After-Sales & Warranty Support",
            ];

        return {
          ...loc,
          badge: loc.badge || (loc.type === "service_center" ? "Official Service Center" : "Authorized Experience Center"),
          district: loc.province || "Western Province",
          directCall: loc.directCall || (loc.phone ? loc.phone.replace(/[^0-9+]/g, "") : "+94112345678"),
          hours: formattedHours,
          latitude: Number(loc.latitude) || 6.9034,
          longitude: Number(loc.longitude) || 79.8524,
          featured: Boolean(loc.featured),
          services: servicesList,
          manager: loc.manager || "Branch Manager",
          imageUrl: loc.imageUrl || null,
        };
      });
    } catch (e: any) {
      console.error("[LocationsRouter] Failed to fetch locations:", e);
      return [];
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [row] = await db
        .select()
        .from(locations)
        .where(eq(locations.id, input.id))
        .limit(1);
      return row || null;
    }),
});

