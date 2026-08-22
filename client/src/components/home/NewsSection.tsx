import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Calendar } from "lucide-react";

const GREEN = "oklch(65% 0.2 145)";

const PLACEHOLDER_NEWS = [
  {
    id: 1,
    title: "Manju Group Expands to 10th Location Across Sri Lanka",
    excerpt:
      "We're thrilled to announce the opening of our newest store, bringing premium electronics and appliances closer to communities island-wide.",
    publishedAt: "2025-11-15",
    slug: "manju-group-10th-location",
    imageUrl: null,
  },
  {
    id: 2,
    title: "Introducing Dew Plus 4K QLED TV — The Future of Home Cinema",
    excerpt:
      "Our latest Dew Plus television lineup brings cinema-grade visuals to your living room, with AI-enhanced picture processing and Dolby Atmos sound.",
    publishedAt: "2025-10-28",
    slug: "dew-plus-4k-qled-launch",
    imageUrl: null,
  },
  {
    id: 3,
    title: "Manju Group Wins National Retailer of the Year 2025",
    excerpt:
      "Recognised for exceptional customer experience, innovation in retail, and commitment to quality, Manju Group takes home the prestigious award.",
    publishedAt: "2025-09-10",
    slug: "national-retailer-award-2025",
    imageUrl: null,
  },
];

const GRADIENT_PLACEHOLDERS = [
  "linear-gradient(135deg, #0a1a0a 0%, #0d2d1a 100%)",
  "linear-gradient(135deg, #0d1a1a 0%, #0a2020 100%)",
  "linear-gradient(135deg, #1a0d1a 0%, #0f1a2a 100%)",
];

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.1,
      ease: [0.23, 1, 0.32, 1] as const,
    },
  }),
};

export default function NewsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const { data } = trpc.blog.list.useQuery({ limit: 3, page: 1 });
  const posts = data?.items?.length ? data.items : PLACEHOLDER_NEWS;

  return (
    <section
      ref={sectionRef}
      className="relative py-24"
      style={{ background: "#000" }}
    >
      {/* Subtle green radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(65% 0.2 145 / 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-12"
        >
          <p className="section-label mb-3">Latest News</p>
          <h2 className="section-title">Stay Updated</h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.id ?? i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300"
              style={{ willChange: "transform" }}
              whileHover={{
                y: -4,
                boxShadow: `0 0 40px oklch(65% 0.2 145 / 0.15)`,
              }}
            >
              {/* Thumbnail */}
              <div
                className="relative h-44 overflow-hidden"
                style={{
                  background: (post as { imageUrl?: string | null }).imageUrl
                    ? undefined
                    : GRADIENT_PLACEHOLDERS[i % GRADIENT_PLACEHOLDERS.length],
                }}
              >
                {(post as { imageUrl?: string | null }).imageUrl && (
                  <img
                    src={
                      (post as { imageUrl?: string | null }).imageUrl as string
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {/* Date badge */}
                <span
                  className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white/80"
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Calendar size={11} />
                  {formatDate(
                    (post as { publishedAt: string | Date })
                      .publishedAt instanceof Date
                      ? (
                          post as { publishedAt: Date }
                        ).publishedAt.toISOString()
                      : (post as { publishedAt: string }).publishedAt
                  )}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="text-white font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-white transition-colors">
                  {post.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed line-clamp-3 mb-4">
                  {(post as { excerpt?: string | null }).excerpt ??
                    (post as { content?: string }).content?.slice(0, 120) + "…"}
                </p>
                <Link
                  href={`/news/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  style={{ color: GREEN }}
                >
                  Read More
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/news"
            className="glass-button inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold text-white/80 hover:text-white transition-all"
          >
            View All News
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
