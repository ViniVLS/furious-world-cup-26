export function formatTimestamp(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as T;
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

export function formatDuration(ms: number): string {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export function getLevelColor(level: string): string {
  switch (level) {
    case 'ERROR': return '#FF4444';
    case 'WARN': return '#FFA500';
    case 'INFO': return '#4FC3F7';
    case 'DEBUG': return '#B0BEC5';
    default: return '#B0BEC5';
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'LIFECYCLE': return '↺';
    case 'METHOD': return '▸';
    case 'STATE': return '◈';
    case 'ECONOMY': return '◉';
    case 'AUDIT': return '★';
    case 'NAVIGATION': return '⤳';
    case 'AUDIO': return '♫';
    case 'PUSH': return '🔔';
    case 'ERROR': return '✖';
    case 'WARN': return '⚠';
    default: return '·';
  }
}

export function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
