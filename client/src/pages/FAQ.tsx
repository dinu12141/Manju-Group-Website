import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: faqs, isLoading } = trpc.faq.list.useQuery();

  const categories = faqs
    ? ["all", ...Array.from(new Set(faqs.map((f) => f.category).filter((c): c is string => c !== null)))]
    : ["all"];

  const filtered = faqs?.filter((faq) => {
    const matchesSearch =
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      (faq.answer && faq.answer.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-navy to-[#1a4a8a] py-14 text-white">
        <div className="container text-center">
          <div className="text-amber text-xs font-bold uppercase tracking-wider mb-2">Help Center</div>
          <h1 className="text-4xl font-bold font-display mb-3">Frequently Asked Questions</h1>
          <p className="text-white/70 max-w-lg mx-auto text-sm mb-6">
            Find answers to common questions about our products, delivery, warranty, and more.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="pl-9 bg-white text-gray-800 border-0 h-11"
            />
          </div>
        </div>
      </div>

      <div className="container py-10 max-w-3xl">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                activeCategory === cat
                  ? "bg-navy text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((faq, i) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenItem(openItem === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800 text-sm pr-4">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 flex-shrink-0 transition-transform ${openItem === faq.id ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openItem === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No results found</h3>
            <p className="text-gray-500 text-sm">Try a different search term or browse all categories.</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-10 bg-gray-50 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-gray-800 mb-2">Still have questions?</h3>
          <p className="text-sm text-gray-500 mb-4">Our support team is ready to help you.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
