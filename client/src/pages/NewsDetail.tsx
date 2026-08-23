import DOMPurify from "dompurify";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Tag, ArrowLeft, Newspaper, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import MainLayout from "@/components/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

interface NewsDetailProps {
  params: { slug: string };
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function NewsDetail({ params }: NewsDetailProps) {
  const { data: post, isLoading } = trpc.blog.bySlug.useQuery({
    slug: params.slug,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-white border-b border-gray-100 py-10">
          <div className="container max-w-3xl">
            <Skeleton className="h-4 w-24 mb-6" />
            <Skeleton className="h-8 w-3/4 mb-3" />
            <Skeleton className="h-4 w-1/3 mb-3" />
          </div>
        </div>
        <div className="container py-10 max-w-3xl">
          <Skeleton className="h-64 sm:h-96 w-full rounded-2xl mb-10" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="container py-20">
          <EmptyState
            icon={<Newspaper size={28} />}
            title="Article Not Found"
            description="The article you're looking for doesn't exist or may have been removed."
            action={
              <Link href="/news">
                <Button className="bg-[#0F2D5E] text-white">
                  Back to News
                </Button>
              </Link>
            }
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Article Header */}
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="container max-w-3xl">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm text-gray-600 font-medium hover:text-[#0F2D5E] mb-6 transition-colors font-medium"
          >
            <ArrowLeft size={14} /> Back to News
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 font-medium mb-4">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {formatDate(post.publishedAt || post.createdAt)}
              </span>
              {post.category && (
                <span
                  className="flex items-center gap-1.5 font-semibold px-2.5 py-0.5 rounded-full text-xs"
                  style={{ backgroundColor: "#C9A84C20", color: "#C9A84C" }}
                >
                  <Tag size={10} /> {post.category}
                </span>
              )}
              {post.authorName && (
                <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <User size={11} /> {post.authorName}
                </span>
              )}
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold font-display mb-4 leading-tight"
              style={{ color: "#0F2D5E" }}
            >
              {post.title}
            </h1>

            {post.excerpt && (
              <p
                className="text-lg text-gray-700 font-medium leading-relaxed border-l-4 pl-5"
                style={{ borderColor: "#C9A84C" }}
              >
                {post.excerpt}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Article Body */}
      <div className="bg-white">
        <div className="container py-10 max-w-3xl">
          {post.coverImageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl overflow-hidden h-64 sm:h-96 mb-10 shadow-lg"
            >
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {post.content && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="prose prose-lg prose-gray max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content),
              }}
            />
          )}

          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
              style={{ color: "#0F2D5E" }}
            >
              <ArrowLeft size={14} /> Back to all articles
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <span className="w-4 h-px bg-[#C9A84C]" />
              <span className="font-bold uppercase tracking-widest text-[#C9A84C]">
                Manju Group News
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
