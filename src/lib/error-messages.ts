import { NextResponse } from "next/server";

export interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
  recoverable: boolean;
}

export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // Network & connectivity
  NETWORK_ERROR: {
    title: "Connection issue",
    message:
      "Couldn't connect to our servers. Check your connection and try again.",
    action: "Try again",
    recoverable: true,
  },
  OFFLINE: {
    title: "You're offline",
    message: "Your work is saved on this device and will sync when you reconnect.",
    recoverable: false,
  },
  RATE_LIMITED: {
    title: "Please wait a moment",
    message: "You're moving fast! Please wait a moment and try again.",
    recoverable: true,
  },

  // Auth
  AUTH_FAILED: {
    title: "Couldn't sign you in",
    message: "We couldn't sign you in. Please try again.",
    action: "Try again",
    recoverable: true,
  },
  AUTH_REQUIRED: {
    title: "Sign in required",
    message: "You need to be signed in to do that.",
    recoverable: true,
  },

  // Photo & file uploads
  UPLOAD_FAILED: {
    title: "Photo couldn't upload",
    message: "This photo couldn't upload. Your other photos are safe.",
    action: "Try again",
    recoverable: true,
  },
  FILE_TOO_LARGE: {
    title: "File too large",
    message: "This file is too large to upload. Please choose a smaller file.",
    recoverable: false,
  },
  INVALID_FILE_TYPE: {
    title: "Unsupported file type",
    message: "This file type isn't supported. Please use a JPEG, PNG, or WebP image.",
    recoverable: false,
  },

  // Memorial
  MEMORIAL_SAVE_FAILED: {
    title: "Couldn't save your memorial",
    message: "Couldn't save right now. Everything is stored locally.",
    action: "Try again",
    recoverable: true,
  },
  MEMORIAL_LOAD_FAILED: {
    title: "Couldn't load memorial",
    message: "Couldn't load your memorial. Please refresh the page.",
    action: "Refresh",
    recoverable: true,
  },
  MEMORIAL_NOT_FOUND: {
    title: "Memorial not found",
    message: "We couldn't find this memorial. It may have been removed.",
    recoverable: false,
  },
  MEMORIAL_DELETE_FAILED: {
    title: "Couldn't delete memorial",
    message: "Couldn't delete this memorial right now. Please try again.",
    action: "Try again",
    recoverable: true,
  },

  // AI / Tribute
  TRIBUTE_GENERATION_FAILED: {
    title: "Taking longer than usual",
    message:
      "Our AI is taking longer than usual. Your conversation is saved.",
    action: "Retry",
    recoverable: true,
  },
  CAPTION_FAILED: {
    title: "Caption unavailable",
    message:
      "We couldn't auto-caption this photo. You can add your own caption below.",
    recoverable: false,
  },

  // Candle
  CANDLE_FAILED: {
    title: "Couldn't save candle",
    message: "Couldn't save your candle right now. Try refreshing the page.",
    recoverable: false,
  },

  // Memory wall
  MEMORY_SUBMIT_FAILED: {
    title: "Memory couldn't be submitted",
    message: "Your memory couldn't be submitted. Please try again.",
    action: "Try again",
    recoverable: true,
  },
  MODERATION_FAILED: {
    title: "Couldn't update memory",
    message: "Couldn't update this memory. Please try again.",
    action: "Try again",
    recoverable: true,
  },

  // Checkout & payments
  CHECKOUT_FAILED: {
    title: "Payment didn't go through",
    message: "Payment didn't go through. You haven't been charged.",
    action: "Try again",
    recoverable: true,
  },

  // Shop / Gelato
  SHOP_ORDER_FAILED: {
    title: "Couldn't place order",
    message: "We couldn't place your order. No payment was taken.",
    action: "Try again",
    recoverable: true,
  },

  // Video
  VIDEO_COMPILATION_FAILED: {
    title: "Video couldn't compile",
    message: "The video couldn't be compiled. Your clips are saved.",
    action: "Try again",
    recoverable: true,
  },
  VIDEO_UPLOAD_FAILED: {
    title: "Video couldn't upload",
    message: "This video couldn't upload. Please try again.",
    action: "Try again",
    recoverable: true,
  },

  // Validation
  INVALID_INPUT: {
    title: "Missing information",
    message: "Please check the form and fill in all required fields.",
    recoverable: true,
  },

  // Generic fallback
  UNKNOWN_ERROR: {
    title: "Something unexpected happened",
    message: "Something unexpected happened. Please try again.",
    action: "Try again",
    recoverable: true,
  },
} as const;

/**
 * Detect if an error is a network/connectivity issue
 */
export function isNetworkError(err: unknown): boolean {
  if (typeof window !== "undefined" && !navigator.onLine) return true;
  if (err instanceof TypeError && err.message.includes("fetch")) return true;
  if (err instanceof TypeError && err.message.includes("Failed to fetch"))
    return true;
  if (err instanceof TypeError && err.message.includes("network")) return true;
  return false;
}

/**
 * Return a structured API error response.
 * Use in API routes instead of NextResponse.json({ error: "string" }).
 */
export function apiError(
  code: string,
  status: number = 400,
  overrideMessage?: string
) {
  const msg = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  return NextResponse.json(
    {
      error: {
        code,
        message: overrideMessage || msg.message,
        recoverable: msg.recoverable,
      },
    },
    { status }
  );
}
