export const CELEBRATE_PROMPTS = [
  (name: string) => `What was ${name}'s favorite thing to do?`,
  (name: string) => `What quirk or habit always made you laugh?`,
  (name: string) => `What's your favorite memory together?`,
  (name: string) => `What made ${name} one of a kind?`,
  (name: string) => `What's a small, everyday moment with ${name} you never want to forget?`,
];

export const SUPPORT_PROMPTS = [
  (name: string) =>
    `What's been weighing on you about ${name}? What guilt or what-ifs keep coming back?`,
  (_name: string) =>
    `Is there anything else you're carrying? It's okay if not.`,
];

export const SUPPORT_CELEBRATE_PROMPTS = [
  (name: string) => `What's your favorite memory with ${name}?`,
  (name: string) => `What made ${name} one of a kind?`,
  (name: string) => `What's a small, everyday moment you never want to forget?`,
];
