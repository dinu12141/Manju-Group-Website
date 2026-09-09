import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Sparkles,
  RefreshCw,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import {
  compressVideo,
  formatFileSize,
  type CompressionResult,
} from "@/lib/videoCompressor";
import { compressImage } from "@/lib/imageCompressor";
import { uploadAdminMedia } from "@/lib/siteSettings";
import { toast } from "sonner";

interface MediaUploaderProps {
  label: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  accept?: "video" | "image" | "both";
  recommendedDimensions?: string;
  className?: string;
}

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".ogg")
  );
};

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  currentUrl,
  onUploaded,
  accept = "both",
  recommendedDimensions,
  className = "",
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lastStats, setLastStats] = useState<{
    originalSize: number;
    compressedSize: number;
    ratio: number;
    isVideo: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptMime =
    accept === "video"
      ? "video/mp4,video/webm,video/quicktime"
      : accept === "image"
      ? "image/png,image/jpeg,image/webp,image/gif"
      : "video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp,image/gif";

  const handleFile = async (file: File) => {
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setLastStats(null);

    try {
      let fileToUpload = file;

      // 1. Compression phase
      if (isVideo) {
        setIsCompressing(true);
        setCompressionProgress(0);

        toast.info(
          `🎬 Compressing ${file.name} (${formatFileSize(file.size)}) using hardware acceleration...`,
          { id: "compress-toast" }
        );

        const compResult: CompressionResult = await compressVideo(file, {
          maxDimension: 1280, // 720p HD
          targetBitrate: 1_600_000, // 1.6 Mbps
          onProgress: (percent) => setCompressionProgress(percent),
        });

        fileToUpload = compResult.file;
        setIsCompressing(false);

        if (compResult.didCompress) {
          setLastStats({
            originalSize: compResult.originalSize,
            compressedSize: compResult.compressedSize,
            ratio: compResult.ratio,
            isVideo: true,
          });
          toast.success(
            `✨ Video compressed: ${formatFileSize(compResult.originalSize)} ➔ ${formatFileSize(compResult.compressedSize)} (${compResult.ratio}% saved!)`,
            { id: "compress-toast" }
          );
        }
      } else {
        // Image compression to WebP
        setIsCompressing(true);
        const imgResult = await compressImage(file, {
          maxDimension: 1920,
          quality: 0.82,
        });
        fileToUpload = imgResult.file;
        setIsCompressing(false);

        if (imgResult.didCompress) {
          setLastStats({
            originalSize: imgResult.originalSize,
            compressedSize: imgResult.compressedSize,
            ratio: imgResult.ratio,
            isVideo: false,
          });
        }
      }

      // 2. Upload phase
      setIsUploading(true);
      setUploadProgress(0);

      const res = await uploadAdminMedia(fileToUpload, (p) => {
        setUploadProgress(p);
      });

      setIsUploading(false);
      onUploaded(res.url);

      toast.success("✅ Media uploaded and ready on website!");
    } catch (err: any) {
      setIsCompressing(false);
      setIsUploading(false);
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to compress/upload media file");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const isBusy = isCompressing || isUploading;
  const isVideo = isVideoUrl(currentUrl) || accept === "video";

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptMime}
        className="hidden"
        disabled={isBusy}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          {accept === "video" ? (
            <Film size={14} className="text-blue-600" />
          ) : (
            <ImageIcon size={14} className="text-blue-600" />
          )}
          <span>{label}</span>
        </label>
        {recommendedDimensions && (
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            {recommendedDimensions}
          </span>
        )}
      </div>

      {/* When media is already uploaded: Visual Preview Card */}
      {currentUrl && !isBusy ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col sm:flex-row items-center gap-4 transition-all hover:border-blue-300"
        >
          {/* Thumbnail Box */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm shrink-0 flex items-center justify-center cursor-pointer group"
            title="Click to preview directly on website"
          >
            {isVideo ? (
              <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
                <video
                  src={currentUrl}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition">
                  <Film size={22} className="text-white drop-shadow" />
                </div>
              </div>
            ) : (
              <img
                src={currentUrl}
                alt="Uploaded media preview"
                className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
              />
            )}

            {/* Quick hover hint */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
              <Eye size={18} />
              <span>Preview</span>
            </div>
          </div>

          {/* Details & In-Website Actions */}
          <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Active on Website
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {isVideo ? "HD Video Asset" : "WebP Optimized Photo"}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Media is loaded directly into the web application.
            </p>

            {/* Direct buttons without external links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#0052B4] hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Eye size={14} />
                View on Website
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                Change Media
              </button>

              <button
                type="button"
                onClick={() => {
                  onUploaded("");
                  setLastStats(null);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Zone when no media is uploaded or when actively uploading */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isBusy && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer select-none ${
            isBusy
              ? "border-blue-400 bg-blue-50/50 cursor-wait"
              : "border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30"
          }`}
        >
          {isCompressing ? (
            <div className="w-full max-w-xs space-y-2 py-2">
              <div className="flex items-center justify-center gap-2 text-blue-700 text-xs font-bold">
                <Sparkles size={16} className="animate-spin text-amber-500" />
                <span>Compressing media ({compressionProgress}%)…</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${compressionProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Hardware-accelerated web optimization in progress
              </p>
            </div>
          ) : isUploading ? (
            <div className="w-full max-w-xs space-y-2 py-2">
              <div className="flex items-center justify-center gap-2 text-emerald-700 text-xs font-bold">
                <Loader2 size={16} className="animate-spin" />
                <span>Uploading to website ({uploadProgress}%)…</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-blue-100/80 text-blue-700 flex items-center justify-center shadow-sm">
                <UploadCloud size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Click to browse or drag &amp; drop file here
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {accept === "video"
                    ? "MP4, WebM, MOV (Auto-compressed to 720p HD)"
                    : accept === "image"
                    ? "PNG, JPG, WebP (Auto-optimized to WebP)"
                    : "Video (MP4/WebM) or Image (WebP/PNG/JPG)"}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Compression Stats Badge */}
      {lastStats && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>
              {lastStats.isVideo ? "Video compressed" : "Image optimized"}:{" "}
              <strong>{formatFileSize(lastStats.originalSize)}</strong> ➔{" "}
              <strong>{formatFileSize(lastStats.compressedSize)}</strong>
            </span>
          </div>
          <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
            {lastStats.ratio}% Smaller
          </span>
        </div>
      )}

      {/* ── IN-WEBSITE LIGHTBOX / MODAL VIEWER (Zero external links) ── */}
      {isLightboxOpen && currentUrl && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 flex flex-col items-center max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="w-full flex items-center justify-between pb-3 px-1 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  {isVideo ? <Film size={16} /> : <ImageIcon size={16} />}
                </div>
                <span className="text-white font-bold text-sm">
                  {isVideo ? "Website Video Preview" : "Website Photo Preview"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close preview"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lightbox Media Body */}
            <div className="w-full flex items-center justify-center py-4 overflow-auto max-h-[72vh]">
              {isVideo ? (
                <video
                  src={currentUrl}
                  controls
                  autoPlay
                  className="max-h-[68vh] max-w-full rounded-2xl shadow-2xl object-contain bg-black"
                />
              ) : (
                <img
                  src={currentUrl}
                  alt="Full website preview"
                  className="max-h-[68vh] max-w-full rounded-2xl shadow-2xl object-contain bg-slate-950"
                />
              )}
            </div>

            {/* Lightbox Footer */}
            <div className="w-full flex items-center justify-between pt-3 px-1 border-t border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 size={14} /> Rendered directly inside Manju Group
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
