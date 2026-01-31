export function generateSlug(petName: string, ownerLastName: string, deathDate?: string | null): string {
  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const name = normalize(petName);
  const lastName = normalize(ownerLastName);
  const year = deathDate
    ? new Date(deathDate).getFullYear()
    : new Date().getFullYear();

  return lastName ? `${name}-${lastName}-${year}` : `${name}-${year}`;
}
