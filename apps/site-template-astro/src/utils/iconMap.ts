export function getServiceIcon(icon?: string): string {
  if (!icon) return '🛠️';
  const clean = icon.toLowerCase().trim();
  const map: Record<string, string> = {
    pipe: '🔧',
    sink: '🚰',
    toilet: '🚽',
    drain: '🚿',
    truck: '🚛',
    water: '💧',
    esgoto: '🔧',
    pia: '🚰',
    vaso: '🚽',
    ralo: '🚿',
    fossa: '🚛',
    hidrojato: '💧'
  };
  if (map[clean]) return map[clean];
  // If it's already an emoji (1 or 2 characters)
  if (icon.length <= 4) return icon;
  return '🛠️';
}
