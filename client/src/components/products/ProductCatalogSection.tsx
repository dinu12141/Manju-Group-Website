import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Download,
  Eye,
  FileText,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CatalogItem {
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
}

export const ProductCatalogSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewCatalog, setPreviewCatalog] = useState<CatalogItem | null>(null);

  const { data: catalogs = [], isLoading } = trpc.catalogs.list.useQuery();
  const recordDownloadMutation = trpc.catalogs.recordDownload.useMutation();

  const categories = [
    "All",
    ...Array.from(new Set(catalogs.map(c => c.category).filter(Boolean))),
  ];

  const filteredCatalogs = catalogs.filter(cat => {
    if (selectedCategory !== "All" && cat.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        cat.title.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.category.toLowerCase().includes(q) ||
        (cat.brand && cat.brand.toLowerCase().includes(q)) ||
        (cat.subtitle && cat.subtitle.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleDownload = (catalog: CatalogItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    recordDownloadMutation.mutate({ id: catalog.id });

    // Open/download file
    const link = document.createElement("a");
    link.href = catalog.fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const filename = catalog.fileUrl.split("/").pop() || `${catalog.title.toLowerCase().replace(/\s+/g, "_")}.pdf`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloading "${catalog.title}"...`, {
      description: "Official Manju Group product catalog.",
      icon: "📥",
    });
  };

  if (!isLoading && catalogs.length === 0) {
    return null;
  }

  return (
    <section
      id="product-catalogs-section"
      className="relative my-8 sm:my-12 overflow-hidden rounded-3xl border border-blue-900/20 bg-gradient-to-br from-[#071739] via-[#0D2556] to-[#0A1B3F] text-white p-6 sm:p-10 shadow-2xl"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10">
        {/* Header Title & Description */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6C2C]/20 border border-[#FF6C2C]/40 text-[#FF854D] text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles size={13} className="text-[#FF6C2C]" />
              <span>Official 2026 Fleet &amp; Product Catalogs</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-display text-white">
              Download Official Product Catalogs
            </h2>
            <p className="text-blue-100/80 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Explore comprehensive technical specifications, colorways, engineering blueprints,
              warranty guidelines, and pricing brochures for all genuine Manju Group brands.
            </p>
          </div>

          {/* Search bar inside catalogs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200/60"
              />
              <input
                type="text"
                placeholder="Search catalog, model, brand..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-xs font-semibold text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-[#FF6C2C] backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/60 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white shrink-0 backdrop-blur-md">
              <BookOpen size={15} className="text-[#FF6C2C]" />
              <span>{filteredCatalogs.length} Available</span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#FF6C2C] text-white shadow-lg shadow-orange-500/30 scale-102"
                    : "bg-white/10 hover:bg-white/15 text-blue-100 border border-white/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Catalog Cards Grid */}
        {filteredCatalogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pt-2">
            {filteredCatalogs.map((catalog, idx) => (
              <motion.div
                key={catalog.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 hover:border-blue-300/40 p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/40 hover:-translate-y-1"
              >
                <div>
                  {/* Thumbnail / Cover Image with hover preview */}
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3.5 bg-slate-900/60 border border-white/10">
                    <img
                      src={catalog.coverImageUrl}
                      alt={catalog.title}
                      className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Badge / Tag (e.g. NEW 2026, FLAGSHIP) */}
                    {catalog.tag && (
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-[#FF6C2C] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        {catalog.tag}
                      </div>
                    )}

                    {/* Year badge */}
                    {catalog.year && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                        {catalog.year}
                      </div>
                    )}

                    {/* Hover quick preview button overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewCatalog(catalog)}
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-slate-100 transition cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Quick Look</span>
                      </button>
                      <button
                        type="button"
                        onClick={e => handleDownload(catalog, e)}
                        className="px-3 py-1.5 rounded-xl bg-[#FF6C2C] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-orange-600 transition cursor-pointer"
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips: Brand & Category */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] font-extrabold uppercase tracking-wide">
                      {catalog.category}
                    </span>
                    {catalog.brand && (
                      <span className="text-white/60 text-[11px] font-semibold truncate">
                        {catalog.brand}
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-sm font-extrabold text-white group-hover:text-blue-200 transition line-clamp-2 leading-snug">
                    {catalog.title}
                  </h3>

                  {catalog.subtitle && (
                    <p className="text-[11px] font-medium text-blue-200/80 mt-1 line-clamp-1">
                      {catalog.subtitle}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-xs text-blue-100/70 mt-2 line-clamp-2 leading-relaxed">
                    {catalog.description}
                  </p>
                </div>

                {/* Card Footer: File Info & Download CTA */}
                <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-blue-200/70 font-medium">
                    <span className="flex items-center gap-1">
                      <FileText size={12} className="text-[#FF6C2C]" />
                      <span>
                        {catalog.fileFormat || "PDF"} • {catalog.fileSize || "Brochure"}
                      </span>
                    </span>
                    {catalog.pageCount && (
                      <span className="flex items-center gap-1 text-white/60">
                        <Layers size={11} />
                        <span>{catalog.pageCount}</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewCatalog(catalog)}
                      className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={e => handleDownload(catalog, e)}
                      className="w-full py-2 px-3 rounded-xl bg-[#FF6C2C] hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-blue-200/60 text-xs">
            No catalogs matching &quot;{searchQuery}&quot;. Try adjusting your search query.
          </div>
        )}
      </div>

      {/* ── PREVIEW & DETAILS MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {previewCatalog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0F1E3D] border border-white/20 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setPreviewCatalog(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Cover Image */}
                <div className="w-full sm:w-48 h-56 rounded-2xl overflow-hidden bg-slate-900 border border-white/15 shrink-0 flex items-center justify-center p-3 relative">
                  <img
                    src={previewCatalog.coverImageUrl}
                    alt={previewCatalog.title}
                    className="w-full h-full object-contain"
                  />
                  {previewCatalog.tag && (
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-lg bg-[#FF6C2C] text-white text-[10px] font-black uppercase">
                      {previewCatalog.tag}
                    </div>
                  )}
                </div>

                {/* Details Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
                      {previewCatalog.category}
                    </span>
                    {previewCatalog.brand && (
                      <span className="text-white/70 text-xs font-bold">
                        {previewCatalog.brand}
                      </span>
                    )}
                    {previewCatalog.year && (
                      <span className="text-white/40 text-xs">• {previewCatalog.year}</span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                    {previewCatalog.title}
                  </h3>

                  {previewCatalog.subtitle && (
                    <p className="text-xs font-bold text-[#FF854D]">
                      {previewCatalog.subtitle}
                    </p>
                  )}

                  <p className="text-xs text-blue-100/80 leading-relaxed">
                    {previewCatalog.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10 text-xs">
                    <div>
                      <span className="text-white/50 block text-[10px] font-bold uppercase">
                        File Type &amp; Size
                      </span>
                      <span className="font-bold text-white">
                        {previewCatalog.fileFormat || "PDF Document"} ({previewCatalog.fileSize || "Standard HD"})
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 block text-[10px] font-bold uppercase">
                        Page Count
                      </span>
                      <span className="font-bold text-white">
                        {previewCatalog.pageCount || "Multi-Page Brochure"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(previewCatalog)}
                      className="flex-1 py-3 px-5 rounded-xl bg-[#FF6C2C] hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition cursor-pointer"
                    >
                      <Download size={15} />
                      <span>Download Catalog (PDF)</span>
                    </button>
                    <a
                      href={previewCatalog.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <span>Open in Browser</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
