/**
 * High-performance, hardware-accelerated in-browser video compressor.
 * Compresses raw video files (4K/1080p, 30-100MB) down to optimized 720p HD (~1.5 Mbps)
 * web-ready assets using native MediaRecorder & HTML5 Canvas before uploading.
 */

export interface VideoCompressionOptions {
  maxDimension?: number; // e.g. 1280 (720p) or 1920 (1080p)
  targetBitrate?: number; // e.g. 1_500_000 (1.5 Mbps)
  onProgress?: (percent: number, currentBytes: number) => void;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  ratio: number; // percentage saved, e.g. 68
  didCompress: boolean;
}

export async function compressVideo(
  inputFile: File,
  options: VideoCompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxDimension = 1280,
    targetBitrate = 1_500_000,
    onProgress,
  } = options;

  const originalSize = inputFile.size;

  // If already under 1.5 MB or MediaRecorder unsupported, skip heavy compression
  if (
    typeof window === "undefined" ||
    typeof MediaRecorder === "undefined" ||
    originalSize <= 1.5 * 1024 * 1024
  ) {
    return {
      file: inputFile,
      originalSize,
      compressedSize: originalSize,
      ratio: 0,
      didCompress: false,
    };
  }

  return new Promise((resolve) => {
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(inputFile);
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.src = objectUrl;

      video.onerror = () => {
        cleanup();
        resolve({
          file: inputFile,
          originalSize,
          compressedSize: originalSize,
          ratio: 0,
          didCompress: false,
        });
      };

      video.onloadedmetadata = async () => {
        try {
          const origW = video.videoWidth || 1280;
          const origH = video.videoHeight || 720;
          const duration = video.duration || 1;

          // Compute target resolution preserving aspect ratio
          let targetW = origW;
          let targetH = origH;
          if (origW > maxDimension || origH > maxDimension) {
            if (origW >= origH) {
              targetW = maxDimension;
              targetH = Math.round((origH * maxDimension) / origW);
            } else {
              targetH = maxDimension;
              targetW = Math.round((origW * maxDimension) / origH);
            }
          }

          // Video encoders require even dimensions
          targetW = targetW % 2 === 0 ? targetW : targetW - 1;
          targetH = targetH % 2 === 0 ? targetH : targetH - 1;

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d", { alpha: false });

          if (!ctx) {
            cleanup();
            resolve({
              file: inputFile,
              originalSize,
              compressedSize: originalSize,
              ratio: 0,
              didCompress: false,
            });
            return;
          }

          // Select best supported MIME type
          const candidateTypes = [
            "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
            "video/mp4",
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm",
          ];

          let mimeType =
            candidateTypes.find((t) => MediaRecorder.isTypeSupported(t)) || "";

          if (!mimeType) {
            cleanup();
            resolve({
              file: inputFile,
              originalSize,
              compressedSize: originalSize,
              ratio: 0,
              didCompress: false,
            });
            return;
          }

          const stream = canvas.captureStream(30);

          let recorder: MediaRecorder;
          try {
            recorder = new MediaRecorder(stream, {
              mimeType,
              videoBitsPerSecond: targetBitrate,
            });
          } catch {
            cleanup();
            resolve({
              file: inputFile,
              originalSize,
              compressedSize: originalSize,
              ratio: 0,
              didCompress: false,
            });
            return;
          }

          const chunks: Blob[] = [];
          let totalBytes = 0;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              chunks.push(e.data);
              totalBytes += e.data.size;
              const progress = Math.min(
                98,
                Math.round((video.currentTime / duration) * 100)
              );
              onProgress?.(progress, totalBytes);
            }
          };

          recorder.onstop = () => {
            cleanup();
            const ext = mimeType.includes("mp4") ? ".mp4" : ".webm";
            const blobType = mimeType.split(";")[0];
            const compressedBlob = new Blob(chunks, { type: blobType });

            // If compressed is somehow bigger than original, stick with original
            if (compressedBlob.size >= originalSize) {
              resolve({
                file: inputFile,
                originalSize,
                compressedSize: originalSize,
                ratio: 0,
                didCompress: false,
              });
              return;
            }

            const baseName = inputFile.name.replace(/\.[^/.]+$/, "");
            const compressedFile = new File(
              [compressedBlob],
              `${baseName}_compressed${ext}`,
              { type: blobType }
            );

            const ratio = Math.round(
              ((originalSize - compressedBlob.size) / originalSize) * 100
            );

            onProgress?.(100, compressedBlob.size);
            resolve({
              file: compressedFile,
              originalSize,
              compressedSize: compressedBlob.size,
              ratio,
              didCompress: true,
            });
          };

          recorder.start(250); // Collect every 250ms

          let animId = 0;
          const drawFrame = () => {
            if (video.paused || video.ended) return;
            ctx.drawImage(video, 0, 0, targetW, targetH);
            const progress = Math.min(
              98,
              Math.round((video.currentTime / duration) * 100)
            );
            onProgress?.(progress, totalBytes);

            if ("requestVideoFrameCallback" in video) {
              (video as any).requestVideoFrameCallback(drawFrame);
            } else {
              animId = requestAnimationFrame(drawFrame);
            }
          };

          video.onended = () => {
            if (animId) cancelAnimationFrame(animId);
            setTimeout(() => {
              if (recorder.state === "recording") {
                recorder.stop();
              }
            }, 300);
          };

          // Play at 1.5x speed for faster compression if browser allows
          video.playbackRate = 1.5;
          await video.play().catch(async () => {
            video.playbackRate = 1.0;
            await video.play();
          });

          drawFrame();
        } catch {
          cleanup();
          resolve({
            file: inputFile,
            originalSize,
            compressedSize: originalSize,
            ratio: 0,
            didCompress: false,
          });
        }
      };

      const cleanup = () => {
        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            // ignore
          }
        }
      };
    } catch {
      resolve({
        file: inputFile,
        originalSize,
        compressedSize: originalSize,
        ratio: 0,
        didCompress: false,
      });
    }
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
