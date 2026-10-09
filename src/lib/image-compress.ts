/**
 * src/lib/image-compress.ts
 *
 * Client-Side Image Compression & Validation Utility
 *
 * Enforces strict client-side file size limits and downscales broker portraits
 * using an HTML5 Canvas to eliminate server load, prevent memory bloat, and
 * optimize local storage and network performance.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: number; // e.g. 95% reduction
}

/**
 * Validates file size and compresses broker portrait on the client side.
 *
 * @param file The uploaded file object
 * @param maxDimension Maximum width/height in pixels (default: 400px for avatar)
 * @param quality JPEG compression quality from 0.1 to 1.0 (default: 0.85)
 * @param maxInputBytes Maximum allowable input size before rejection (default: 5MB)
 */
export async function compressBrokerPhoto(
  file: File,
  maxDimension = 400,
  quality = 0.85,
  maxInputBytes = 5 * 1024 * 1024 // 5 MB strict ceiling
): Promise<CompressionResult> {
  // 1. Strict limit: Immediately reject files exceeding maxInputBytes
  if (file.size > maxInputBytes) {
    const maxMb = (maxInputBytes / (1024 * 1024)).toFixed(0);
    throw new Error(
      `Photo file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${maxMb} MB.`
    );
  }

  // 2. Validate MIME type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (JPG, PNG, or WebP).');
  }

  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file from disk.'));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Corrupt or unsupported image format.'));
      };

      img.onload = () => {
        // Calculate proportional dimensions capped at maxDimension
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Draw onto lightweight offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D rendering context unavailable.'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to high-efficiency JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Approximate binary size of Base64 string
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSizeBytes = Math.round((base64Length * 3) / 4);
        const compressedSizeKb = Math.round(compressedSizeBytes / 1024);
        const compressionRatio = Math.max(
          0,
          Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100)
        );

        resolve({
          dataUrl,
          originalSizeKb,
          compressedSizeKb,
          compressionRatio,
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
