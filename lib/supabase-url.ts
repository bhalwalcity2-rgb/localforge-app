export function normalizeSupabaseUrl(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const parsedUrl = new URL(value.trim());
    return parsedUrl.origin;
  } catch {
    return null;
  }
}
