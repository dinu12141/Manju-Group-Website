import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  TrendingUp,
  Sparkles,
  X,
  Layers,
  Building2,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import ActiveFilterChips from "@/components/ActiveFilterChips";
import { cleanText } from "@/lib/data";

export interface FilterState {
  brandId?: number;
  categoryId?: number;
  priceRange?: [number, number];
  inStockOnly: boolean;
  bestSellersOnly: boolean;
  newArrivalsOnly: boolean;
}

interface FilterPanelProps {
  brands: Array<{
    id: number;
    name: string;
    slug?: string;
    primaryColor?: string | null;
  }>;
  categories?: Array<{ id: number; name: string; slug?: string }>;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClear: () => void;
  className?: string;
  collapsible?: boolean;
}

const PRICE_PRESETS: Array<{ label: string; range: [number, number] }> = [
  { label: "Under 1K", range: [0, 1000] },
  { label: "1K–50K", range: [1000, 50000] },
  { label: "50K–200K", range: [50000, 200000] },
  { label: "200K–500K", range: [200000, 500000] },
  { label: "500K+", range: [500000, 1000000] },
];

const PRICE_MIN = 0;
const PRICE_MAX = 1000000;
const PRICE_STEP = 500;

export default function FilterPanel({
  brands,
  categories = [],
  filters,
  onFilterChange,
  onClear,
  className,
  collapsible = false,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState({
    categories: true,
    brands: true,
    price: true,
    availability: true,
  });
  const [showAllBrands, setShowAllBrands] = useState(false);

  const update = (patch: Partial<FilterState>) =>
    onFilterChange({ ...filters, ...patch });

  const hasActiveFilters = Boolean(
    filters.brandId ||
      filters.categoryId ||
      filters.priceRange ||
      filters.inStockOnly ||
      filters.bestSellersOnly ||
      filters.newArrivalsOnly
  );

  const visibleBrands = showAllBrands ? brands : brands.slice(0, 8);
  const priceRange = filters.priceRange ?? [PRICE_MIN, PRICE_MAX];

  const toggle = (key: keyof typeof expanded) => {
    if (collapsible) setExpanded(e => ({ ...e, [key]: !e[key] }));
  };

  const handleRemoveChip = (key: keyof FilterState) => {
    if (
      key === "inStockOnly" ||
      key === "bestSellersOnly" ||
      key === "newArrivalsOnly"
    ) {
      update({ [key]: false });
    } else {
      update({ [key]: undefined });
    }
  };

  const SectionHeader = ({
    label,
    icon: Icon,
    sectionKey,
  }: {
    label: string;
    icon: any;
    sectionKey: keyof typeof expanded;
  }) => (
    <button
      type="button"
      className="w-full flex items-center justify-between text-xs font-bold text-slate-900 tracking-wider mb-2.5 py-1 text-left group cursor-pointer"
      onClick={() => toggle(sectionKey)}
      disabled={!collapsible}
    >
      <span className="flex items-center gap-2 text-slate-900 font-bold">
        <Icon size={14} className="text-[#0F2D5E]" />
        {label}
      </span>
      {collapsible && (
        <ChevronDown
          size={14}
          className={`text-slate-500 group-hover:text-slate-800 transition-transform ${expanded[sectionKey] ? "rotate-180" : ""}`}
        />
      )}
    </button>
  );

  return (
    <div className={`space-y-4 text-slate-900 ${className ?? ""}`}>
      {/* Active Filters summary */}
      {hasActiveFilters && (
        <div className="pb-3 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Active Filters
            </span>
            <button
              onClick={onClear}
              className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>
          <ActiveFilterChips
            filters={filters}
            brands={brands}
            categories={categories}
            onRemove={handleRemoveChip}
            onClear={onClear}
          />
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <SectionHeader
            label="Categories"
            icon={Layers}
            sectionKey="categories"
          />
          <AnimatePresence initial={false}>
            {expanded.categories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => update({ categoryId: undefined })}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-bold transition-all cursor-pointer ${
                      !filters.categoryId
                        ? "bg-[#0F2D5E] text-white shadow-xs"
                        : "text-slate-800 hover:text-slate-950 hover:bg-slate-100"
                    }`}
                  >
                    <span>All Categories</span>
                    {!filters.categoryId && (
                      <CheckCircle2 size={13} className="text-white" />
                    )}
                  </button>

                  {categories.map(cat => {
                    const isSelected = filters.categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          update({
                            categoryId: isSelected ? undefined : cat.id,
                          })
                        }
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#0F2D5E] text-white shadow-xs"
                            : "text-slate-800 hover:text-slate-950 hover:bg-slate-100"
                        }`}
                      >
                        <span>{cleanText(cat.name)}</span>
                        {isSelected && (
                          <CheckCircle2 size={13} className="text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="border-t border-slate-200" />

      {/* Brands */}
      <div>
        <SectionHeader label="Brands" icon={Building2} sectionKey="brands" />
        <AnimatePresence initial={false}>
          {expanded.brands && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="space-y-1">
                <label
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    !filters.brandId
                      ? "bg-blue-50 border border-blue-300 text-[#0F2D5E] font-bold"
                      : "hover:bg-slate-100 text-slate-800 font-semibold"
                  }`}
                >
                  <Checkbox
                    checked={!filters.brandId}
                    onCheckedChange={() => update({ brandId: undefined })}
                    className="border-slate-400"
                  />
                  <span className="text-xs">All Brands</span>
                </label>

                {visibleBrands.map(brand => {
                  const isSelected = filters.brandId === brand.id;
                  return (
                    <label
                      key={brand.id}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 border border-blue-300 text-[#0F2D5E] font-bold"
                          : "hover:bg-slate-100 text-slate-800 font-semibold"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={checked =>
                          update({ brandId: checked ? brand.id : undefined })
                        }
                        className="border-slate-400"
                      />
                      <span className="text-xs flex-1 truncate">
                        {cleanText(brand.name)}
                      </span>
                    </label>
                  );
                })}

                {brands.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllBrands(v => !v)}
                    className="text-xs text-[#F85606] font-bold hover:underline pl-2 mt-1 cursor-pointer"
                  >
                    {showAllBrands
                      ? "Show less"
                      : `Show more (${brands.length - 8})`}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-slate-200" />

      {/* Price Range */}
      <div>
        <SectionHeader
          label="Price Range (LKR)"
          icon={Tag}
          sectionKey="price"
        />
        <AnimatePresence initial={false}>
          {expanded.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>LKR {priceRange[0].toLocaleString()}</span>
                  <span>LKR {priceRange[1].toLocaleString()}</span>
                </div>

                <Slider
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={priceRange}
                  onValueChange={val => {
                    const [lo, hi] = val;
                    if (lo === PRICE_MIN && hi === PRICE_MAX) {
                      update({ priceRange: undefined });
                    } else {
                      update({ priceRange: [lo, hi] as [number, number] });
                    }
                  }}
                  className="[&_[data-slot=slider-range]]:bg-[#F85606] [&_[data-slot=slider-thumb]]:border-[#F85606]"
                />

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {PRICE_PRESETS.map(preset => {
                    const isActive =
                      filters.priceRange?.[0] === preset.range[0] &&
                      filters.priceRange?.[1] === preset.range[1];
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          update({
                            priceRange: isActive ? undefined : preset.range,
                          })
                        }
                        className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-all text-center cursor-pointer ${
                          isActive
                            ? "bg-[#F85606] text-white border-[#F85606] shadow-xs"
                            : "bg-slate-50 text-slate-800 border-slate-300 hover:border-[#F85606] hover:bg-orange-50 hover:text-[#F85606]"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-slate-200" />

      {/* Availability & Highlights */}
      <div>
        <SectionHeader
          label="Availability & Status"
          icon={Sparkles}
          sectionKey="availability"
        />
        <AnimatePresence initial={false}>
          {expanded.availability && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="space-y-1">
                <label
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    filters.inStockOnly
                      ? "bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold"
                      : "hover:bg-slate-100 text-slate-800 font-semibold"
                  }`}
                >
                  <Checkbox
                    checked={filters.inStockOnly}
                    onCheckedChange={v => update({ inStockOnly: Boolean(v) })}
                    className="border-slate-400"
                  />
                  <span className="text-xs">In Stock Only</span>
                </label>

                <label
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    filters.bestSellersOnly
                      ? "bg-amber-50 border border-amber-300 text-amber-950 font-bold"
                      : "hover:bg-slate-100 text-slate-800 font-semibold"
                  }`}
                >
                  <Checkbox
                    checked={filters.bestSellersOnly}
                    onCheckedChange={v =>
                      update({ bestSellersOnly: Boolean(v) })
                    }
                    className="border-slate-400"
                  />
                  <span className="text-xs flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-amber-600" /> Best
                    Sellers
                  </span>
                </label>

                <label
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    filters.newArrivalsOnly
                      ? "bg-blue-50 border border-blue-300 text-blue-950 font-bold"
                      : "hover:bg-slate-100 text-slate-800 font-semibold"
                  }`}
                >
                  <Checkbox
                    checked={filters.newArrivalsOnly}
                    onCheckedChange={v =>
                      update({ newArrivalsOnly: Boolean(v) })
                    }
                    className="border-slate-400"
                  />
                  <span className="text-xs flex items-center gap-1.5">
                    <Sparkles size={13} className="text-blue-600" /> New
                    Arrivals
                  </span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="w-full justify-center gap-1.5 text-slate-800 border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors mt-2 cursor-pointer font-bold"
        >
          <X size={14} /> Clear All Filters
        </Button>
      )}
    </div>
  );
}
