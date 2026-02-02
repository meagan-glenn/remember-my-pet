export type Gender = "male" | "female" | "neutral" | null | undefined;

export interface Pronouns {
  subject: string; // he / she / they
  object: string; // him / her / them
  possessive: string; // his / her / their
  reflexive: string; // himself / herself / themselves
}

export function getPronouns(gender: Gender): Pronouns {
  switch (gender) {
    case "male":
      return { subject: "he", object: "him", possessive: "his", reflexive: "himself" };
    case "female":
      return { subject: "she", object: "her", possessive: "her", reflexive: "herself" };
    default:
      return { subject: "they", object: "them", possessive: "their", reflexive: "themselves" };
  }
}

/** Pronouns + verb conjugation helpers for natural language */
export function getPronounContext(petName: string, gender: Gender) {
  const p = getPronouns(gender);
  return {
    petName,
    ...p,
    wasWere: p.subject === "they" ? "were" : "was",
    hasHave: p.subject === "they" ? "have" : "has",
    doesDo: p.subject === "they" ? "do" : "does",
    Subject: p.subject.charAt(0).toUpperCase() + p.subject.slice(1),
    Possessive: p.possessive.charAt(0).toUpperCase() + p.possessive.slice(1),
  };
}
