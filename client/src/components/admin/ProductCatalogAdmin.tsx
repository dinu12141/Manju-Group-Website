import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  Edit,
  ExternalLink,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Loader2,
  X,
  Layers,
  Calendar,
  Tag,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { uploadAdminMedia } from "@/lib/siteSettings";
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
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORY_SUGGESTIONS = [
  "Electric Bikes",
  "Air Conditioners",
  "Water Purification",
  "Solar & Appliances",
  "Smart Electronics",
  "General Hardware",
];

const BRAND_SUGGESTIONS = [
  "Manju E-Bikes",
  "Super General",
  "Pure Drop",
  "Manju Solar",
  "Dew Plus",
  "Dew Motors",
  "Manju Group",
];

export const ProductCatalogAdmin: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Partial<CatalogItem> | null>(null);
  const [deletingCatalog, setDeletingCatalog] = useState<CatalogItem | null>(null);

  // Upload progress states
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const {
    data: catalogs = [],
    isLoading,
    refetch,
  } = trpc.catalogs.adminList.useQuery();

  const saveCatalogMutation = trpc.catalogs.saveCatalog.useMutation({
    onSuccess: () => {
      utils.catalogs.adminList.invalidate();
      utils.catalogs.list.invalidate();
      setIsModalOpen(false);
      setEditingCatalog(null);
      toast.success("Product catalog saved successfully!");
    },
    onError: err => {
      toast.error(err.message || "Failed to save catalog");
    },
  });

  const deleteCatalogMutation = trpc.catalogs.deleteCatalog.useMutation({
    onSuccess: () => {
      utils.catalogs.adminList.invalidate();
      utils.catalogs.list.invalidate();
      setDeletingCatalog(null);
      toast.success("Catalog deleted successfully");
    },
    onError: err => {
      toast.error(err.message || "Failed to delete catalog");
    },
  });

  const toggleActiveMutation = trpc.catalogs.toggleCatalogActive.useMutation({
    onSuccess: (_, vars) => {
      utils.catalogs.adminList.invalidate();
      utils.catalogs.list.invalidate();
      toast.success(
        vars.isActive ? "Catalog published to website" : "Catalog unpublished"
      );
    },
    onError: err => {
      toast.error(err.message || "Failed to toggle status");
    },
  });

  const seedMutation = trpc.catalogs.seedDefaultCatalogs.useMutation({
    onSuccess: () => {
      utils.catalogs.adminList.invalidate();
      utils.catalogs.list.invalidate();
      toast.success("Official default catalogs restored!");
    },
    onError: err => {
      toast.error(err.message || "Failed to seed catalogs");
    },
  });

  // Category list
  const categories = [
    "All",
    ...Array.from(new Set(catalogs.map(c => c.category).filter(Boolean))),
  ];

  // Filtered catalogs
  const filteredCatalogs = catalogs.filter(cat => {
    if (categoryFilter !== "All" && cat.category !== categoryFilter) {
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

  // Stats
  const totalCount = catalogs.length;
  const activeCount = catalogs.filter(c => c.isActive).length;
  const totalDownloads = catalogs.reduce((acc, c) => acc + (c.downloadCount || 0), 0);

  const handleOpenCreate = () => {
    setEditingCatalog({
      title: "",
      subtitle: "",
      category: "Electric Bikes",
      brand: "Manju E-Bikes",
      description: "",
      coverImageUrl: "/scooter_red.webp",
      fileUrl: "/catalogs/manju_ebikes_catalog_2026.pdf",
      fileSize: "6.0 MB",
      fileFormat: "PDF",
      pageCount: "24 Pages",
      year: "2026 Edition",
      tag: "NEW 2026",
      sortOrder: (catalogs.length || 0) + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CatalogItem) => {
    setEditingCatalog({
      ...item,
    });
    setIsModalOpen(true);
  };

  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingCover(true);
    setCoverUploadProgress(0);
    try {
      const res = await uploadAdminMedia(file, p => setCoverUploadProgress(p));
      setEditingCatalog(prev => (prev ? { ...prev, coverImageUrl: res.url } : null));
      toast.success("Cover image uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload cover image");
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingPdf(true);
    setPdfUploadProgress(0);
    try {
      const res = await uploadAdminMedia(file, p => setPdfUploadProgress(p));
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setEditingCatalog(prev =>
        prev
          ? {
              ...prev,
              fileUrl: res.url,
              fileSize: sizeMb,
              fileFormat: "PDF",
            }
          : null
      );
      toast.success("PDF catalog uploaded and ready!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload PDF file");
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatalog) return;

    if (!editingCatalog.title?.trim()) {
      toast.error("Catalog title is required");
      return;
    }
    if (!editingCatalog.category?.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!editingCatalog.description?.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!editingCatalog.coverImageUrl?.trim()) {
      toast.error("Cover image URL is required");
      return;
    }
    if (!editingCatalog.fileUrl?.trim()) {
      toast.error("Catalog PDF file URL is required");
      return;
    }

    saveCatalogMutation.mutate({
      id: editingCatalog.id,
      title: editingCatalog.title.trim(),
      subtitle: editingCatalog.subtitle?.trim() || null,
      category: editingCatalog.category.trim(),
      brand: editingCatalog.brand?.trim() || null,
      description: editingCatalog.description.trim(),
      coverImageUrl: editingCatalog.coverImageUrl.trim(),
      fileUrl: editingCatalog.fileUrl.trim(),
      fileSize: editingCatalog.fileSize?.trim() || "PDF",
      fileFormat: editingCatalog.fileFormat?.trim() || "PDF",
      pageCount: editingCatalog.pageCount?.trim() || null,
      year: editingCatalog.year?.trim() || "2026 Edition",
      tag: editingCatalog.tag?.trim() || null,
      sortOrder: Number(editingCatalog.sortOrder) || 0,
      isActive: editingCatalog.isActive !== false,
    });
  };

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER & HERO BANNER ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6C2C]/20 border border-[#FF6C2C]/40 text-[#FF6C2C] text-xs font-black uppercase tracking-wider mb-2.5">
              <BookOpen size={13} />
              <span>Digital Marketing &amp; Sales Literature</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-display text-white">
              Product Catalogs &amp; e-Brochure Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Upload, organize, and publish digital PDF catalogs and engineering spec sheets
              available for instant customer download on the official Products page.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-[#FF6C2C] hover:bg-[#E55A1B] text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Add New Catalog</span>
            </button>
            <button
              type="button"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Reset to 4 official pre-packaged catalogs"
            >
              <RefreshCw size={13} className={seedMutation.isPending ? "animate-spin" : ""} />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              Total Catalogs
            </span>
            <span className="text-2xl font-black text-white">{totalCount}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-emerald-400 block uppercase">
              Live &amp; Active
            </span>
            <span className="text-2xl font-black text-emerald-400">{activeCount}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-orange-400 block uppercase">
              Customer Downloads
            </span>
            <span className="text-2xl font-black text-[#FF6C2C]">{totalDownloads}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-blue-400 block uppercase">
              Website Exposure
            </span>
            <span className="text-xs font-bold text-slate-300 block mt-1">
              Live on /products
            </span>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH & CATEGORY FILTERS ─────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by catalog title, brand, description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052B4]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? "bg-[#0F172A] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CATALOG ITEMS LIST / GRID ──────────────────────────────────── */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#0052B4] mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading digital product catalogs…</p>
        </div>
      ) : filteredCatalogs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#FF6C2C] flex items-center justify-center mx-auto mb-3">
            <BookOpen size={28} />
          </div>
          <h3 className="text-base font-black text-slate-900">No Product Catalogs Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            {searchQuery
              ? "No catalogs matched your search query. Try clearing the search filter."
              : "Get started by adding your first product catalog or brochure for customer downloads."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-[#FF6C2C] text-white text-xs font-bold rounded-xl hover:bg-[#E55A1B] cursor-pointer"
            >
              + Create Catalog
            </button>
            <button
              type="button"
              onClick={() => seedMutation.mutate()}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Load Defaults
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCatalogs.map(catalog => (
            <motion.div
              key={catalog.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail & Quick Actions */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-4 flex items-center justify-center p-3">
                  <img
                    src={catalog.coverImageUrl}
                    alt={catalog.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Active / Draft Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        toggleActiveMutation.mutate({
                          id: catalog.id,
                          isActive: !catalog.isActive,
                        })
                      }
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer transition ${
                        catalog.isActive
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-slate-400 text-white hover:bg-slate-500"
                      }`}
                      title="Click to toggle publication"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          catalog.isActive ? "bg-white animate-pulse" : "bg-white/60"
                        }`}
                      />
                      <span>{catalog.isActive ? "Published" : "Draft"}</span>
                    </button>
                  </div>

                  {/* Tag badge */}
                  {catalog.tag && (
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-lg bg-[#FF6C2C] text-white text-[10px] font-black uppercase shadow-xs">
                      {catalog.tag}
                    </div>
                  )}

                  {/* Direct PDF Link */}
                  <a
                    href={catalog.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs transition"
                  >
                    <span>View PDF</span>
                    <ExternalLink size={10} />
                  </a>
                </div>

                {/* Category & Brand */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#0052B4] text-[10px] font-black uppercase tracking-wide">
                    {catalog.category}
                  </span>
                  {catalog.brand && (
                    <span className="text-[11px] font-bold text-slate-500">
                      {catalog.brand}
                    </span>
                  )}
                  {catalog.year && (
                    <span className="text-[11px] font-bold text-slate-400 ml-auto">
                      {catalog.year}
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                  {catalog.title}
                </h3>
                {catalog.subtitle && (
                  <p className="text-xs text-[#0052B4] font-bold mt-0.5 line-clamp-1">
                    {catalog.subtitle}
                  </p>
                )}

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {catalog.description}
                </p>
              </div>

              {/* Card Footer: Metadata and Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <FileText size={12} className="text-slate-400" />
                    <span>
                      {catalog.fileFormat || "PDF"} • {catalog.fileSize || "Brochure"}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 font-bold">
                    <Download size={11} />
                    <span>{catalog.downloadCount || 0} dl</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(catalog)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingCatalog(catalog)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                    title="Delete Catalog"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── MODAL: ADD / EDIT PRODUCT CATALOG ───────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && editingCatalog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 text-xs my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052B4] font-black text-[10px] uppercase mb-1">
                    <BookOpen size={11} />
                    <span>Catalog Configuration</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingCatalog.id ? "Edit Product Catalog" : "Add New Product Catalog"}
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Provide title, category, cover photo, and direct PDF link for customer downloads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCatalog(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveSubmit} className="space-y-5">
                {/* 1. Identity & Classification */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                    1. Identity &amp; Categorization
                  </span>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Catalog Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCatalog.title || ""}
                      onChange={e =>
                        setEditingCatalog({ ...editingCatalog, title: e.target.value })
                      }
                      placeholder="e.g. Manju Electric Bikes & Scooters 2026 Catalog"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        value={editingCatalog.subtitle || ""}
                        onChange={e =>
                          setEditingCatalog({ ...editingCatalog, subtitle: e.target.value })
                        }
                        placeholder="e.g. Complete Specs, Range & Lithium Battery Options"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Badge / Tag (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingCatalog.tag || ""}
                        onChange={e =>
                          setEditingCatalog({ ...editingCatalog, tag: e.target.value })
                        }
                        placeholder="e.g. NEW 2026, FLAGSHIP, POPULAR"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Product Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        list="catalog-categories-list"
                        value={editingCatalog.category || ""}
                        onChange={e =>
                          setEditingCatalog({ ...editingCatalog, category: e.target.value })
                        }
                        placeholder="e.g. Electric Bikes"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                      <datalist id="catalog-categories-list">
                        {CATEGORY_SUGGESTIONS.map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        list="catalog-brands-list"
                        value={editingCatalog.brand || ""}
                        onChange={e =>
                          setEditingCatalog({ ...editingCatalog, brand: e.target.value })
                        }
                        placeholder="e.g. Manju E-Bikes or Super General"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                      />
                      <datalist id="catalog-brands-list">
                        {BRAND_SUGGESTIONS.map(br => (
                          <option key={br} value={br} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Catalog Description &amp; Highlights <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={editingCatalog.description || ""}
                      onChange={e =>
                        setEditingCatalog({ ...editingCatalog, description: e.target.value })
                      }
                      placeholder="Describe what models, technical specs, parts, and warranty details are included in this catalog..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* 2. Cover Photo & Media */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                    2. Cover Preview Photo
                  </span>

                  {/* Hidden file input for cover */}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleCoverUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Cover Preview */}
                    <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-xs">
                      {editingCatalog.coverImageUrl ? (
                        <img
                          src={editingCatalog.coverImageUrl}
                          alt="Cover"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <BookOpen size={24} className="text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          disabled={isUploadingCover}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                          {isUploadingCover ? (
                            <Loader2 size={13} className="animate-spin text-blue-600" />
                          ) : (
                            <UploadCloud size={13} className="text-blue-600" />
                          )}
                          <span>
                            {isUploadingCover
                              ? `Uploading (${coverUploadProgress}%)`
                              : "Upload Cover Photo"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingCatalog({ ...editingCatalog, coverImageUrl: "" })
                          }
                          className="px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>

                      <input
                        type="text"
                        required
                        value={editingCatalog.coverImageUrl || ""}
                        onChange={e =>
                          setEditingCatalog({
                            ...editingCatalog,
                            coverImageUrl: e.target.value,
                          })
                        }
                        placeholder="Or paste cover image URL (e.g. /scooter_red.webp)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-700 outline-none focus:ring-2 focus:ring-[#0052B4]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Catalog PDF / Document File */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                    3. Catalog PDF Document File
                  </span>

                  {/* Hidden file input for PDF */}
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handlePdfUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={isUploadingPdf}
                        className="px-4 py-2 rounded-xl bg-[#0052B4] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingPdf ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UploadCloud size={14} />
                        )}
                        <span>
                          {isUploadingPdf
                            ? `Uploading PDF (${pdfUploadProgress}%)`
                            : "Upload PDF from Device"}
                        </span>
                      </button>

                      {editingCatalog.fileUrl && (
                        <a
                          href={editingCatalog.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition"
                        >
                          <Eye size={12} />
                          <span>Test Link</span>
                        </a>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={editingCatalog.fileUrl || ""}
                      onChange={e =>
                        setEditingCatalog({ ...editingCatalog, fileUrl: e.target.value })
                      }
                      placeholder="Paste PDF link (e.g. /catalogs/manju_ebikes_catalog_2026.pdf or cloud link)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:ring-2 focus:ring-[#0052B4] outline-none"
                    />
                  </div>

                  {/* File Metadata Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">
                        Format
                      </label>
                      <input
                        type="text"
                        value={editingCatalog.fileFormat || "PDF"}
                        onChange={e =>
                          setEditingCatalog({ ...editingCatalog, fileFormat: e.target.value })
                        }
                        placeholder="PDF"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">
                        File Size
                      </label>
                      <input
                        type="text"
                        value={editingCatalog.fileSize || ""}
                        onChange={e =>
                          setEditingCatalog({ ...editingCatalog, fileSize: e.target.value })
                        }
                        placeholder="e.g. 6.4 MB"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">
                        Page Count
                      </label>
                      <input
                        type="text"
                        value={editingCatalog.pageCount || ""}
                        onChange={e =>
                          setEditingCatalog({ ...editingCatalog, pageCount: e.target.value })
                        }
                        placeholder="e.g. 28 Pages"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">
                        Edition Year
                      </label>
                      <input
                        type="text"
                        value={editingCatalog.year || "2026 Edition"}
                        onChange={e =>
                          setEditingCatalog({ ...editingCatalog, year: e.target.value })
                        }
                        placeholder="2026 Edition"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Display Sequence & Publication Toggle */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Display Sort Order
                    </label>
                    <input
                      type="number"
                      value={editingCatalog.sortOrder ?? 0}
                      onChange={e =>
                        setEditingCatalog({
                          ...editingCatalog,
                          sortOrder: Number(e.target.value) || 0,
                        })
                      }
                      className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    <input
                      type="checkbox"
                      id="activeCatalogToggle"
                      checked={editingCatalog.isActive !== false}
                      onChange={e =>
                        setEditingCatalog({
                          ...editingCatalog,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label
                      htmlFor="activeCatalogToggle"
                      className="font-bold text-slate-800 cursor-pointer text-xs"
                    >
                      🟢 Published &amp; Visible for Download on Website
                    </label>
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingCatalog(null);
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveCatalogMutation.isPending}
                    className="px-6 py-2.5 bg-[#0052B4] hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-900/20 cursor-pointer transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {saveCatalogMutation.isPending && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    <span>
                      {saveCatalogMutation.isPending
                        ? "Saving Catalog..."
                        : editingCatalog.id
                        ? "Save Catalog Changes"
                        : "Create Product Catalog"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: DELETE CONFIRMATION ─────────────────────────────────── */}
      <AnimatePresence>
        {deletingCatalog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Delete Product Catalog?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <strong>&quot;{deletingCatalog.title}&quot;</strong>?
                  Customers will no longer be able to download this catalog from the website.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCatalog(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    deleteCatalogMutation.mutate({ id: deletingCatalog.id })
                  }
                  disabled={deleteCatalogMutation.isPending}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {deleteCatalogMutation.isPending && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  <span>Delete Permanently</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
