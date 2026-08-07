export function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  
  try {
    if (dateStr.includes('T')) {
      return dateStr.replace('T', ' ').substring(0, 16);
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
