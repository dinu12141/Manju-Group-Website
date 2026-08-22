import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { FilterState } from "./FilterPanel";

function formatK(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n}`;
}

import { cleanText } from "@/lib/data";

interface ActiveFilterChipsProps {
  filters: FilterState;
  brands: Array<{ id: number; name: string }>;
  categories?: Array<{ id: number; name: string }>;
  onRemove: (key: keyof FilterState) => void;
  onClear: () => void;
}

export default function ActiveFilterChips({
  filters,
  brands,
  categories,
  onRemove,
  onClear,
}: ActiveFilterChipsProps) {
  const chips: Array<{
    key: keyof FilterState;
    label: string;
    colorClass: string;
  }> = [];

  if (filters.brandId) {
    const rawName = brands.find(b => b.id === filters.brandId)?.name ?? "Brand";
    chips.push({
      key: "brandId",
      label: cleanText(rawName),
      colorClass: "bg-blue-100 text-[#0F2D5E] font-bold border border-blue-200",
    });
  }
  if (filters.categoryId && categories) {
    const rawName =
      categories.find(c => c.id === filters.categoryId)?.name ?? "Category";
    chips.push({
      key: "categoryId",
      label: cleanText(rawName),
      colorClass: "bg-blue-100 text-[#0F2D5E] font-bold border border-blue-200",
    });
  }
  if (filters.priceRange) {
    const label = `LKR ${formatK(filters.priceRange[0])} – ${formatK(filters.priceRange[1])}`;
    chips.push({
      key: "priceRange",
      label,
      colorClass:
        "bg-orange-100 text-[#F85606] font-bold border border-orange-200",
    });
  }
  if (filters.inStockOnly) {
    chips.push({
      key: "inStockOnly",
      label: "In Stock",
      colorClass:
        "bg-emerald-100 text-emerald-900 font-bold border border-emerald-200",
    });
  }
  if (filters.bestSellersOnly) {
    chips.push({
      key: "bestSellersOnly",
      label: "Best Sellers",
      colorClass:
        "bg-amber-100 text-amber-950 font-bold border border-amber-200",
    });
  }
  if (filters.newArrivalsOnly) {
    chips.push({
      key: "newArrivalsOnly",
      label: "New Arrivals",
      colorClass: "bg-sky-100 text-sky-950 font-bold border border-sky-200",
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <AnimatePresence>
        {chips.map(chip => (
          <motion.div
            key={chip.key}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${chip.colorClass}`}
          >
            {chip.label}
            <button
              onClick={() => onRemove(chip.key)}
              aria-label={`Remove ${chip.label} filter`}
              className="hover:opacity-70 transition-opacity ml-0.5"
            >
              <X size={11} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
