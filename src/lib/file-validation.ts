import { randomUUID } from "crypto";

/**
 * Magic byte signatures for allowed file types.
 * Validates actual file content, not just MIME type headers.
 */
const IMAGE_SIGNATURES: { bytes: number[]; offset?: number; ext: string }[] = [
  { bytes: [0xff, 0xd8, 0xff], ext: "jpg" }, // JPEG
  { bytes: [0x89, 0x50, 0x4e, 0x47], ext: "png" }, // PNG
  // WebP: RIFF....WEBP
  { bytes: [0x52, 0x49, 0x46, 0x46], ext: "webp" }, // RIFF header (WebP check requires offset 8)
  // HEIC/HEIF: ftyp at offset 4
  { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, ext: "heic" },
];

const VIDEO_SIGNATURES: { bytes: number[]; offset?: number; ext: string }[] = [
  // MP4/MOV: ftyp at offset 4
  { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, ext: "mp4" },
  // WebM: EBML header
  { bytes: [0x1a, 0x45, 0xdf, 0xa3], ext: "webm" },
];

function matchesSignature(
  buffer: Uint8Array,
  sig: { bytes: number[]; offset?: number }
): boolean {
  const offset = sig.offset ?? 0;
  if (buffer.length < offset + sig.bytes.length) return false;
  return sig.bytes.every((byte, i) => buffer[offset + i] === byte);
}

/**
 * Validates that a file's actual content matches one of the allowed image types.
 * Returns the verified extension or null if no match.
 */
export function validateImageMagicBytes(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer).slice(0, 16);

  for (const sig of IMAGE_SIGNATURES) {
    if (matchesSignature(bytes, sig)) {
      // Extra check for WebP: verify "WEBP" at offset 8
      if (sig.ext === "webp") {
        const webpMarker = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
        if (!webpMarker.every((b, i) => bytes[8 + i] === b)) continue;
      }
      return sig.ext;
    }
  }
  return null;
}

/**
 * Validates that a file's actual content matches one of the allowed video types.
 * Returns the verified extension or null if no match.
 */
export function validateVideoMagicBytes(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer).slice(0, 16);

  for (const sig of VIDEO_SIGNATURES) {
    if (matchesSignature(bytes, sig)) return sig.ext;
  }
  return null;
}

/**
 * Generates a random filename using crypto.randomUUID to prevent enumeration.
 */
export function randomFileName(ext: string): string {
  return `${randomUUID()}.${ext}`;
}
