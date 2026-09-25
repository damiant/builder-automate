const TAG_HUES = [42, 160, 210, 280, 330, 12, 95, 250] as const;

export function tagColorForName(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  const hue = TAG_HUES[hash % TAG_HUES.length];
  return `hsl(${hue} 68% 52%)`;
}
