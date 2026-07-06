import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" });
}

export default function News() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery({ page: 1, limit: 12 });

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-navy to-[#1a4a8a] py-14 text-white">
        <div className="container">
          <div className="text-amber text-xs font-bold uppercase tracking-wider mb-2">Latest Updates</div>
          <h1 className="text-4xl font-bold font-display mb-3">News & Blog</h1>
          <p className="text-white/70 max-w-xl text-sm leading-relaxed">
            Stay updated with the latest news, product launches, and stories from Manju Group.
          </p>
        </div>
      </div>

      <div className="container py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts && posts.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.items.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3 }}
              >
                <Link href={`/news/${post.slug}`}>
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      {post.coverImageUrl ? (
                        <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 text-5xl">📰</div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(post.publishedAt || post.createdAt)}</span>
                        {post.category && <span className="flex items-center gap-1"><Tag size={11} /> {post.category}</span>}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 flex-1">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>}
                      <div className="flex items-center gap-1 text-navy text-sm font-semibold mt-auto">
                        Read More <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📰</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h3>
            <p className="text-gray-500 text-sm">Check back soon for news and updates from Manju Group.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
