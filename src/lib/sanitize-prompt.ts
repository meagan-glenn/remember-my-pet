/**
 * Sanitizes user-provided strings before embedding in AI system prompts.
 * Strips characters commonly used in prompt injection attacks
 * while preserving normal pet names and descriptions.
 */
export function sanitizeForPrompt(input: string): string {
  return input
    // Remove control characters
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
    // Collapse multiple newlines into one space (prevents prompt structure breaking)
    .replace(/\n+/g, " ")
    // Remove common prompt injection delimiters
    .replace(/```/g, "")
    .replace(/<\/?[a-zA-Z][^>]*>/g, "") // Strip HTML-like tags
    .trim();
}
