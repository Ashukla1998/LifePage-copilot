export const SERVICE_OPTIONS = [
  'Architecture',
  'Interiors',
  'Landscape',
  'Elevation',
  'Planning',
] as const;

export const SERVICE_SEPARATOR = ' | ';

// Year to enter as End Year for ongoing projects
export const CURRENT_PROJECT_END_YEAR = '2100';

// Parse a stored "Architecture | Interior" string into known service options
export function parseServices(service: string): string[] {
  const items = service
    .split(/[|,]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return SERVICE_OPTIONS.filter((opt) =>
    items.some((item) => opt.toLowerCase() === item || opt.toLowerCase().startsWith(item))
  );
}

// Join selected services in the canonical option order
export function joinServices(selected: string[]): string {
  return SERVICE_OPTIONS.filter((opt) => selected.includes(opt)).join(SERVICE_SEPARATOR);
}

// Keep legacy values like "100% completed" or "12,00,000 sq.ft." only if they are plain numbers
export function toNumericString(value: string): string {
  const cleaned = value
    .replace(/,/g, '')
    .replace(/%|completed|sq\.?\s*ft\.?|sqft/gi, '')
    .trim();
  return /^\d+(\.\d+)?$/.test(cleaned) ? cleaned : '';
}
