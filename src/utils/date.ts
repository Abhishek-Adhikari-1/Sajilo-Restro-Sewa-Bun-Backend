export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addHours(date: Date, hours: number): Date {
  return addMinutes(date, hours * 60);
}

export function addDays(date: Date, days: number): Date {
  return addHours(date, days * 24);
}

/** Returns true if the given date is in the past */
export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

/** Returns true if the given date is within `thresholdMinutes` of expiring */
export function isExpiringSoon(date: Date, thresholdMinutes = 5): boolean {
  return date.getTime() < Date.now() + thresholdMinutes * 60 * 1000;
}
