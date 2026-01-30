export function generateSlug(petName: string, deathDate?: string | null): string {
  const year = deathDate
    ? new Date(deathDate).getFullYear()
    : new Date().getFullYear();

  const slug = petName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slug}-${year}`;
}
