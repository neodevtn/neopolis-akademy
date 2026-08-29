export function firstNameForHome(name?: string | null) {
  const firstName = name?.trim().split(/\s+/)[0];
  return firstName || null;
}
