import { Link } from "wouter";
import { Calendar, Tag, ArrowLeft, Newspaper } from "lucide-react";
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
        <div className="container py-10 max-w-3xl">
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-3/4 mb-3" />
          <Skeleton className="h-4 w-1/3 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
                <Button className="bg-navy text-white">Back to News</Button>
              </Link>
            }
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10 max-w-3xl">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Back to News
        </Link>

        {post.coverImageUrl && (
          <div className="rounded-2xl overflow-hidden h-64 sm:h-80 mb-6">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={12} />{" "}
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          {post.category && (
            <span className="flex items-center gap-1">
              <Tag size={12} /> {post.category}
            </span>
          )}
          {post.authorName && <span>By {post.authorName}</span>}
        </div>

        <h1 className="text-3xl font-bold text-gray-800 font-display mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-gray-500 leading-relaxed mb-6 border-l-4 border-navy pl-4">
            {post.excerpt}
          </p>
        )}

        {post.content && (
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
      </div>
    </MainLayout>
  );
}
