import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
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

      toast.success(
        `✅ Uploaded & updated successfully! Available at ${res.url}`
      );
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

  return (
    <div className={`space-y-2 ${className}`}>
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

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !isBusy && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer select-none ${
          isBusy
            ? "border-blue-400 bg-blue-50/50 cursor-wait"
            : "border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30"
        }`}
      >
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

        {isCompressing ? (
          <div className="w-full max-w-xs space-y-2 py-2">
            <div className="flex items-center justify-center gap-2 text-blue-700 text-xs font-bold">
              <Sparkles size={16} className="animate-spin text-amber-500" />
              <span>Compressing video ({compressionProgress}%)…</span>
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
              <span>Uploading to server ({uploadProgress}%)…</span>
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

      {/* Current URL indicator & manual input fallback */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={currentUrl}
          onChange={(e) => onUploaded(e.target.value)}
          placeholder="Media URL (e.g. /uploads/video.mp4)"
          className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {currentUrl && (
          <button
            type="button"
            onClick={() => window.open(currentUrl, "_blank")}
            className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Preview media in new tab"
          >
            View
          </button>
        )}
      </div>
    </div>
  );
};
