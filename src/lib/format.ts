export function formatPrice(value: number): string {
  return `£${value.toFixed(2)}`;
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function currentYearOptions(span = 3): string[] {
  const year = new Date().getFullYear();
  return Array.from({ length: span }, (_, i) => String(year + i));
}

/** True when the given month/year is more than 30 days out — a signal the
 *  customer may still be in contract with their current provider. */
export function isMoreThan30DaysOut(monthName: string, year: string): boolean {
  const monthIndex = MONTHS.indexOf(monthName);
  if (monthIndex === -1 || !year) return false;
  const target = new Date(Number(year), monthIndex, 1);
  const diffDays = (target.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diffDays > 30;
}
