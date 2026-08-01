/**
 * Client-side image compression to stay under Vercel's 4.5MB body size limit.
 * Resizes to max 2048px on the longest side and reduces JPEG quality until
 * the file is under the target size.
 */

const MAX_DIMENSION = 2048;
const TARGET_SIZE = 4 * 1024 * 1024; // 4MB — safely under Vercel's 4.5MB limit

function isHeic(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$|\.heif$/i.test(file.name)
  );
}

export function compressImage(file: File): Promise<File> {
  // Skip if already small enough and is JPEG/WebP (no resize needed)
  if (file.size <= TARGET_SIZE) return Promise.resolve(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("No canvas context")); return; }
      ctx.drawImage(img, 0, 0, width, height);

      // Try decreasing quality until under target size
      const qualities = [0.85, 0.75, 0.65, 0.5];
      let attempt = 0;

      function tryCompress() {
        const quality = qualities[attempt] ?? 0.5;
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error("Compression failed")); return; }
            if (blob.size <= TARGET_SIZE || attempt >= qualities.length - 1) {
              resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
            } else {
              attempt++;
              tryCompress();
            }
          },
          "image/jpeg",
          quality,
        );
      }

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Most browsers (all except Safari) can't decode HEIC, so large iPhone
      // photos land here. The server accepts HEIC, so pass the original
      // through instead of failing the whole upload — if it's over the body
      // limit the server's 413 gives the user a clear "too large" message.
      if (isHeic(file)) {
        resolve(file);
        return;
      }
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}
