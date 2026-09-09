/**
 * High-performance client-side image optimizer.
 * Compresses images (JPEG/PNG) to optimized WebP (max 1920px width/height, 0.82 quality),
 * typically saving 70-90% bandwidth for banners and cards.
 */

export interface ImageCompressionOptions {
  maxDimension?: number;
  quality?: number; // 0.1 to 1.0
}

export async function compressImage(
  inputFile: File,
  options: ImageCompressionOptions = {}
): Promise<{
  file: File;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  didCompress: boolean;
}> {
  const { maxDimension = 1920, quality = 0.82 } = options;
  const originalSize = inputFile.size;

  // SVG doesn't need canvas compression
  if (inputFile.type === "image/svg+xml" || originalSize <= 80 * 1024) {
    return {
      file: inputFile,
      originalSize,
      compressedSize: originalSize,
      ratio: 0,
      didCompress: false,
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => {
      resolve({
        file: inputFile,
        originalSize,
        compressedSize: originalSize,
        ratio: 0,
        didCompress: false,
      });
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        resolve({
          file: inputFile,
          originalSize,
          compressedSize: originalSize,
          ratio: 0,
          didCompress: false,
        });
      };

      img.onload = () => {
        try {
          let w = img.width;
          let h = img.height;

          if (w > maxDimension || h > maxDimension) {
            if (w >= h) {
              h = Math.round((h * maxDimension) / w);
              w = maxDimension;
            } else {
              w = Math.round((w * maxDimension) / h);
              h = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve({
              file: inputFile,
              originalSize,
              compressedSize: originalSize,
              ratio: 0,
              didCompress: false,
            });
            return;
          }

          ctx.drawImage(img, 0, 0, w, h);

          // Try exporting to WebP
          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= originalSize) {
                // Keep original if WebP isn't smaller
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
              const compressedFile = new File([blob], `${baseName}.webp`, {
                type: "image/webp",
              });

              const ratio = Math.round(
                ((originalSize - blob.size) / originalSize) * 100
              );

              resolve({
                file: compressedFile,
                originalSize,
                compressedSize: blob.size,
                ratio,
                didCompress: true,
              });
            },
            "image/webp",
            quality
          );
        } catch {
          resolve({
            file: inputFile,
            originalSize,
            compressedSize: originalSize,
            ratio: 0,
            didCompress: false,
          });
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(inputFile);
  });
}
