const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LONG_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * High-performance date formatter for YYYY-MM-DD strings.
 * Avoids `new Date()` and `.toLocaleDateString()` overhead which is ~100x slower.
 */
export function formatDate(
  dateStr: string | null | undefined,
  format: 'short' | 'short-year' | 'long' | 'weekday-short' | 'weekday-long' | 'datetime' | 'short-time' = 'short'
): string {
  if (!dateStr) return '';

  // Try fast path for standard YYYY-MM-DD format (no time)
  if (dateStr.length >= 10 && dateStr[4] === '-' && dateStr[7] === '-') {
    const yStr = dateStr.slice(0, 4);
    const m = parseInt(dateStr.slice(5, 7), 10);
    const dStr = dateStr.slice(8, 10);
    const d = parseInt(dStr, 10);

    if (yStr && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      if (format === 'short') {
        // e.g., "27 Oct"
        return `${d} ${SHORT_MONTHS[m - 1]}`;
      } else if (format === 'short-year') {
        // e.g., "27 Oct 2023"
        return `${d} ${SHORT_MONTHS[m - 1]} ${yStr}`;
      } else if (format === 'long') {
        // e.g., "27 October 2023"
        return `${d} ${LONG_MONTHS[m - 1]} ${yStr}`;
      }
      // Weekdays and time-based formats fall back to Date parsing since calculating Day of Week is complex
    }
  }

  // Fallback for non-standard strings, weekday formats, or datetimes
  try {
    let d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) {
      d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
    }

    switch (format) {
      case 'short':
        return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
      case 'short-year':
        return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
      case 'long':
        return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
      case 'weekday-short':
        return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
      case 'weekday-long':
        return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      case 'datetime':
        return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      case 'short-time':
        return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
      default:
        return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
    }
  } catch (e) {
    return dateStr;
  }
}
