export function formatRangeKm(km: number): string {
  if (km >= 1_000_000) {
    return `${(km / 1_000_000).toFixed(2)}M KM`;
  }
  if (km >= 1_000) {
    return `${(km / 1_000).toFixed(1)}K KM`;
  }
  return `${km} KM`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
