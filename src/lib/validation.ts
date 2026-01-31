const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateMemoryContent(content: string): {
  valid: boolean;
  error?: string;
} {
  if (!content || !content.trim()) {
    return { valid: false, error: "Memory content is required" };
  }
  if (wordCount(content) > 500) {
    return { valid: false, error: "Memory must be 500 words or fewer" };
  }
  return { valid: true };
}
