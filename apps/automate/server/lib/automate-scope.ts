import { resolveOrgIdForEmail } from "@agent-native/core/org";
import { getRequestOrgId, getRequestUserEmail } from "@agent-native/core/server";

export async function requireOrgId(): Promise<string> {
  const fromContext = getRequestOrgId();
  if (fromContext) return fromContext;

  const email = getRequestUserEmail();
  if (!email) {
    throw new Error("Sign in is required.");
  }

  const resolved = await resolveOrgIdForEmail(email);
  if (resolved) return resolved;

  throw new Error(
    "No workspace organization is linked to your account. Create or join an organization from team settings, then try again.",
  );
}

export function normalizeTagKey(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const display = raw.trim();
    if (!display) continue;
    const key = normalizeTagKey(display);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(display);
  }
  return result;
}
