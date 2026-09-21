import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Loader2,
  Package,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated?: (newCategory: { id: number; name: string; slug: string }) => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  onCategoryCreated,
}: CategoryManagerModalProps) {
  const utils = trpc.useUtils();

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = trpc.categories.adminList.useQuery(undefined, {
    enabled: isOpen,
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder(0);
    setEditingCategoryId(null);
  };

  const handleStartEdit = (cat: any) => {
    setEditingCategoryId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setSortOrder(cat.sortOrder || 0);
  };

  const autoGenerateSlug = (value: string) => {
    setName(value);
    if (!editingCategoryId) {
      const generated = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const invalidateAll = () => {
    utils.categories.adminList.invalidate();
    utils.categories.list.invalidate();
    utils.admin.categoryOptions.invalidate();
    utils.admin.products.invalidate();
    utils.products.invalidate();
    refetch();
  };

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: (newCat) => {
      toast.success(`Category "${newCat.name}" created successfully!`);
      invalidateAll();
      resetForm();
      if (onCategoryCreated) {
        onCategoryCreated(newCat);
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create category");
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: (updatedCat) => {
      toast.success(`Category "${updatedCat.name}" updated successfully!`);
      invalidateAll();
      resetForm();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update category");
    },
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      setDeletingId(null);
      invalidateAll();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete category");
      setDeletingId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategoryId) {
      updateMutation.mutate({
        id: editingCategoryId,
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || null,
        sortOrder: Number(sortOrder) || 0,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || null,
        sortOrder: Number(sortOrder) || 0,
      });
    }
  };

  const handleDelete = (id: number, catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      setDeletingId(id);
      deleteMutation.mutate({ id });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 my-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#0F2D5E] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6C2C] text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Product Categories Manager
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Add, organize and customize product categories for the Products page
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Add / Edit Form Box */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                {editingCategoryId ? (
                  <>
                    <Edit2 size={14} className="text-blue-600" />
                    <span>Edit Category #{editingCategoryId}</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} className="text-emerald-600" />
                    <span>Add New Product Category</span>
                  </>
                )}
              </span>
              {editingCategoryId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => autoGenerateSlug(e.target.value)}
                  placeholder="e.g. Solar Systems, Spare Parts"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Slug (Auto-generated)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Tag size={13} />
                  </div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="solar-systems"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of items in this category"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Order
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ArrowUpDown size={13} />
                  </div>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : editingCategoryId ? (
                    <>
                      <Check size={14} />
                      <span>Update Category</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Create Category</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Existing Categories Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Existing Categories ({categories.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Live on website Products page &amp; filters
              </span>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-slate-400">
                <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-semibold">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                No categories found. Use the form above to add your first category!
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-black uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Category Name</th>
                      <th className="p-3">Slug</th>
                      <th className="p-3 text-center">Products</th>
                      <th className="p-3 text-center">Order</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                            <Layers size={13} />
                          </span>
                          <span>{cat.name}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          {cat.slug}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {cat.productCount} SKUs
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-500">
                          {cat.sortOrder}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === cat.id || cat.productCount > 0}
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                cat.productCount > 0
                                  ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                                  : "bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600"
                              }`}
                              title={
                                cat.productCount > 0
                                  ? `Cannot delete: ${cat.productCount} products assigned`
                                  : "Delete Category"
                              }
                            >
                              {deletingId === cat.id ? (
                                <Loader2 size={13} className="animate-spin text-red-500" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Categories are updated live on the Products page and filters</span>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
