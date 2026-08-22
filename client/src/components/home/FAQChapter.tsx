import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircle } from "lucide-react";
import { Link } from "wouter";

const FAQS = [
  {
    question: "Does Manju Group offer island-wide delivery?",
    answer:
      "Yes, we deliver to all 25 districts in Sri Lanka. Orders dispatched within 24 hours.",
  },
  {
    question: "What warranty do products come with?",
    answer:
      "All products carry a 100% manufacturer-backed warranty. Claim at any showroom or call us.",
  },
  {
    question: "Where can I service my Dew Motors electric bike?",
    answer:
      "Authorized service centers in Colombo, Kandy, Galle, and other major cities. Call +94 11 234 5678.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Visa, Mastercard, American Express, Bank Transfer, and Cash on Delivery for selected areas.",
  },
  {
    question: "Can I visit a showroom before buying?",
    answer:
      "Yes! Visit our Locations page to find the nearest Manju Group showroom across Sri Lanka.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "Call +94 11 234 5678 (Mon–Fri 8:30AM–6PM, Sat 9AM–4PM) or email info@manjugroup.lk.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function FAQChapter() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white relative z-20 border-t border-gray-100">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: Title + CTA card */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-gold" />
              <span className="text-xs font-bold text-gold uppercase tracking-[0.2em]">
                Got Questions?
              </span>
            </div>
            <h2
              className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] text-gray-900 mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Frequently{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #0F2D5E, #C9A84C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Asked
              </span>
              <br />
              Questions
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm">
              Find answers to common questions about our products, delivery, and
              services.
            </p>

            {/* CTA card */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 flex flex-col gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0F2D5E] flex items-center justify-center text-white">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#0F2D5E] mb-1">
                  Still have questions?
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Our team is available Mon–Fri 8:30AM–6PM to help you.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#0F2D5E] text-white font-semibold text-sm hover:bg-[#1a4a8a] transition-colors w-fit"
              >
                Contact Us →
              </Link>
            </div>
          </div>

          {/* RIGHT: Accordion */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="lg:col-span-7 space-y-3"
          >
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`rounded-2xl border overflow-hidden bg-white shadow-sm transition-all duration-300 ${
                    isOpen
                      ? "border-[#0F2D5E]/20 shadow-md"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                  >
                    <span
                      className={`font-semibold text-base transition-colors leading-snug ${
                        isOpen ? "text-[#0F2D5E]" : "text-gray-800"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? "bg-[#0F2D5E] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 text-gray-500 leading-relaxed text-sm">
                          <div className="w-full h-px bg-gray-100 mb-4" />
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
