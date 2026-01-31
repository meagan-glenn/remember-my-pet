const CRISIS_PATTERNS = [
  /\bsuicid/i,
  /\bkill\s+(my|him|her|them)self/i,
  /\bend\s+(it|my\s+life)/i,
  /\bwant\s+to\s+die/i,
  /\bdon'?t\s+want\s+to\s+(be\s+here|live|exist)/i,
  /\bself[- ]?harm/i,
  /\bhurt\s+(my|him|her|them)self/i,
  /\bno\s+reason\s+to\s+live/i,
  /\bbetter\s+off\s+(dead|without\s+me)/i,
];

export function detectCrisisKeywords(text: string): boolean {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}
