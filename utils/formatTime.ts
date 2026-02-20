// utils/formatTime.ts

/** Pad number to 2 digits */
export const pad = (n: number): string => n.toString().padStart(2, '0');

/** Format milliseconds to HH:MM:SS */
export const formatMs = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

/** Format milliseconds to HH:MM:SS.cc (centiseconds) */
export const formatMsDetailed = (ms: number): { main: string; cents: string } => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const cs = Math.floor((ms % 1000) / 10);

  const main = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return { main, cents: `.${pad(cs)}` };
};

/** Convert h/m/s to total milliseconds */
export const toMs = (hours: number, minutes: number, seconds: number): number =>
  (hours * 3600 + minutes * 60 + seconds) * 1000;

/** Convert total milliseconds to h/m/s */
export const fromMs = (ms: number): { hours: number; minutes: number; seconds: number } => {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

/** Human-friendly duration label (e.g. "1m 30s") */
export const durationLabel = (ms: number): string => {
  const { hours, minutes, seconds } = fromMs(ms);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
};

/** Format a Date to a short time string */
export const formatTimestamp = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/** Format a Date to date + time */
export const formatDateTime = (date: Date): string => {
  const d = new Date(date);
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};
