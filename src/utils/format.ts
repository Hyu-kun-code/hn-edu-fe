export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

const DMY_RE = /^\d{2}\/\d{2}\/\d{4}$/;
const DMY_DATETIME_RE = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;

/** Formats a date-only value as dd/MM/yyyy. Accepts either ISO ("2026-09-15", e.g. from DatePicker) or the backend's own dd/MM/yyyy. */
export function formatDate(dateOnly: string): string {
  if (DMY_RE.test(dateOnly)) return dateOnly;
  const [y, m, d] = dateOnly.split("T")[0].split("-").map(Number);
  return `${pad(d)}/${pad(m)}/${y}`;
}

/** Formats a date-time value as dd/MM/yyyy HH:mm:ss. Accepts either an ISO timestamp or the backend's own dd/MM/yyyy HH:mm:ss. */
export function formatDateTime(isoDateTime: string): string {
  if (DMY_DATETIME_RE.test(isoDateTime)) return isoDateTime;
  const d = new Date(isoDateTime);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/** Converts the backend's LocalDate wire format (dd/MM/yyyy) to ISO ("2026-09-15") for DatePicker. */
export function toIsoDate(dmyDate: string): string {
  const [d, m, y] = dmyDate.split("/").map(Number);
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Converts the backend's LocalDateTime wire format (dd/MM/yyyy HH:mm:ss) to an ISO date + "HH:mm" pair for DatePicker/TimePicker. */
export function toIsoDateTime(dmyDateTime: string): { date: string; time: string } {
  const [datePart, timePart] = dmyDateTime.split(" ");
  return { date: toIsoDate(datePart), time: timePart.slice(0, 5) };
}

/** Strips everything but digits — use on input change before storing/formatting. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Formats a digit string with thousand separators for display in an input, e.g. "1500000" -> "1.500.000". */
export function formatThousands(digits: string): string {
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
}
