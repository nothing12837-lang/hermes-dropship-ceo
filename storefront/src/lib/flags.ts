// Minimal feature flags + experiment buckets - free, no vendor.
// Usage: getFlag("hero_evaa") -> boolean, getVariant("price_show") -> "A"|"B"
const FLAGS: Record<string, boolean> = {
  hero_evaa: true,
  visual_search: false,
  live_drop: true,
};

export function getFlag(name: string): boolean {
  return FLAGS[name] ?? false;
}

export function getVariant(name: string, id = ""): "A" | "B" {
  let h = 0;
  const s = `${name}:${id}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 2 === 0 ? "A" : "B";
}
