import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, SearchX } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { Link } from "wouter";

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: faqs, isLoading } = trpc.faq.list.useQuery();

  const categories = faqs
    ? [
        "all",
        ...Array.from(
          new Set(
            faqs.map(f => f.category).filter((c): c is string => c !== null)
          )
        ),
      ]
    : ["all", "Delivery", "Products", "Warranty", "Payment", "Support"];

  const filtered = faqs?.filter(faq => {
    const matchesSearch =
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      (faq.answer && faq.answer.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-20">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              Help Center
            </span>
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold font-display mb-4"
            style={{ color: "#0F2D5E" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-gray-700 font-medium max-w-lg mx-auto text-sm leading-relaxed">
            Find answers to common questions about our products, delivery,
            warranty, and more.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="py-6 bg-white border-b border-gray-100">
        <div className="container">
          <div className="relative max-w-md mx-auto">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium"
            />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="pl-10 border-gray-200 text-gray-800 h-12 rounded-xl focus:ring-2 focus:ring-[#0F2D5E]/20"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-4 bg-white">
        <div className="container">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize border ${
                  activeCategory === cat
                    ? "text-white border-transparent shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#0F2D5E]/40 hover:text-[#0F2D5E]"
                }`}
                style={
                  activeCategory === cat
                    ? { backgroundColor: "#0F2D5E", borderColor: "#0F2D5E" }
                    : {}
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <section className="py-12 bg-gray-50">
        <div className="container max-w-3xl">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((faq, i) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
                    openItem === faq.id
                      ? "border-[#0F2D5E]/20"
                      : "border-gray-100"
                  }`}
                >
                  <button
                    onClick={() =>
                      setOpenItem(openItem === faq.id ? null : faq.id)
                    }
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 text-base pr-4">
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        openItem === faq.id
                          ? "text-white"
                          : "bg-gray-100 text-gray-700 font-medium"
                      }`}
                      style={
                        openItem === faq.id
                          ? { backgroundColor: "#0F2D5E" }
                          : {}
                      }
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${openItem === faq.id ? "rotate-180" : ""}`}
                      />
                    </div>
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
                        <div className="w-full h-px bg-gray-100 mb-4" />
                        <div className="px-6 pb-6 text-sm text-gray-700 font-medium leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<SearchX size={28} />}
              title="No results found"
              description="Try a different search term or browse all categories."
            />
          )}
        </div>
      </section>

      {/* CTA Card */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div
            className="rounded-2xl p-8 text-white"
            style={{ backgroundColor: "#0F2D5E" }}
          >
            <h3 className="font-bold text-xl mb-2">Still have questions?</h3>
            <p className="text-white/70 text-sm mb-6">
              Contact our team — available Mon–Fri 8:30AM–6PM, Sat 9AM–4PM.
            </p>
            <Link href="/contact">
              <button className="px-6 py-2.5 bg-white text-[#0F2D5E] rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
