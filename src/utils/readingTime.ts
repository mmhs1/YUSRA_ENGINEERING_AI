export function getReadingTime(text: string): string {
  if (!text) return "< 1 min read";
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / 200);
  return time > 1 ? `${time} min read` : "< 1 min read";
}
