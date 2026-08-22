import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Newspaper, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function News() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery({
    page: 1,
    limit: 12,
  });

  const featured = posts?.items[0];
  const rest = posts?.items.slice(1) ?? [];

  return (
    <MainLayout>
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-20">
        <div className="container">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-5 h-px" style={{ background: "#C9A84C" }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#C9A84C" }}
              >
                News &amp; Insights
              </span>
            </div>
            <h1
              className="text-5xl font-black font-display mb-4"
              style={{ color: "#0F2D5E" }}
            >
              Latest from Manju Group
            </h1>
            <p className="text-gray-700 font-medium max-w-xl text-sm leading-relaxed">
              Stay updated with the latest product launches, company news, and
              stories from Manju Group — Sri Lanka's trusted multi-brand
              company.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="container py-14 space-y-8">
          <Skeleton className="h-72 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                <Skeleton className="h-52 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : posts && posts.items.length > 0 ? (
        <>
          {/* Featured Post */}
          {featured && (
            <div className="bg-white py-12">
              <div className="container">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Link href={`/news/${featured.slug}`}>
                    <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col lg:flex-row">
                      <div className="lg:w-[45%] h-[280px] bg-gray-100 overflow-hidden relative flex-shrink-0">
                        {featured.coverImageUrl ? (
                          <img
                            src={featured.coverImageUrl}
                            alt={featured.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <Newspaper size={64} />
                          </div>
                        )}
                        <span
                          className="absolute top-4 left-4 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: "#0F2D5E" }}
                        >
                          Featured
                        </span>
                        {featured.category && (
                          <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                            {featured.category}
                          </span>
                        )}
                      </div>
                      <div className="lg:w-[55%] p-8 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 mb-3">
                          <span
                            className="w-4 h-px"
                            style={{ background: "#C9A84C" }}
                          />
                          <span
                            className="text-xs font-bold uppercase tracking-widest"
                            style={{ color: "#C9A84C" }}
                          >
                            Latest News
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-[#0F2D5E] transition-colors">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="text-gray-700 font-medium text-sm leading-relaxed mb-5 line-clamp-3">
                            {featured.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-600 font-medium mb-6">
                          <Calendar size={12} />
                          <span>
                            {formatDate(
                              featured.publishedAt || featured.createdAt
                            )}
                          </span>
                        </div>
                        <div
                          className="inline-flex items-center gap-2 text-sm font-semibold"
                          style={{ color: "#0F2D5E" }}
                        >
                          Read Full Story{" "}
                          <ArrowRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </div>
          )}

          {/* All Articles Grid */}
          {rest.length > 0 && (
            <div className="bg-gray-50 py-12">
              <div className="container">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-xl font-bold text-gray-900">
                    All Articles
                  </h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link href={`/news/${post.slug}`}>
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer h-full flex flex-col group">
                          <div className="h-[180px] bg-gray-100 overflow-hidden relative">
                            {post.coverImageUrl ? (
                              <img
                                src={post.coverImageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200">
                                <Newspaper size={40} />
                              </div>
                            )}
                            {post.category && (
                              <span
                                className="absolute top-3 left-3 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1"
                                style={{
                                  backgroundColor: "rgba(15,45,94,0.9)",
                                }}
                              >
                                <Tag size={8} /> {post.category}
                              </span>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium mb-3">
                              <Calendar size={11} />
                              <span>
                                {formatDate(post.publishedAt || post.createdAt)}
                              </span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 flex-1 leading-snug group-hover:text-[#0F2D5E] transition-colors">
                              {post.title}
                            </h3>
                            {post.excerpt && (
                              <p className="text-sm text-gray-700 font-medium line-clamp-2 mb-4 leading-relaxed">
                                {post.excerpt}
                              </p>
                            )}
                            <div
                              className="flex items-center gap-1.5 text-sm font-semibold mt-auto group-hover:gap-2.5 transition-all"
                              style={{ color: "#0F2D5E" }}
                            >
                              Read More <ArrowRight size={13} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="container py-14">
          <EmptyState
            icon={<Newspaper size={28} />}
            title="No posts yet"
            description="Check back soon for news and updates from Manju Group."
          />
        </div>
      )}
    </MainLayout>
  );
}
