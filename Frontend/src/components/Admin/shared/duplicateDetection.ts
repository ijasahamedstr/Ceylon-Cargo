import type { BookingData } from "./StageBookingBoard";

/** Normalize phone for comparison */
export function normMobile(mobile: string) {
  return (mobile || "").replace(/\D/g, "");
}

/** Key: same person can have multiple bookings — flag by mobile + iqama */
export function personKey(b: Pick<BookingData, "sender_mobile" | "sender_iqama">) {
  return `${normMobile(b.sender_mobile)}|${(b.sender_iqama || "").trim()}`;
}

/** Key: same display name + mobile (weaker match) */
export function nameMobileKey(b: Pick<BookingData, "sender_name" | "sender_mobile">) {
  return `${(b.sender_name || "").trim().toLowerCase()}|${normMobile(b.sender_mobile)}`;
}

export interface DuplicateInfo {
  /** Booking IDs that share a person key with at least one other row */
  duplicateIds: Set<string>;
  /** personKey → count */
  personCounts: Map<string, number>;
  /** Groups of booking IDs with same person key (size > 1) */
  duplicateGroups: string[][];
}

export function findDuplicates(bookings: BookingData[]): DuplicateInfo {
  const byPerson = new Map<string, string[]>();

  for (const b of bookings) {
    const key = personKey(b);
    if (!byPerson.has(key)) byPerson.set(key, []);
    byPerson.get(key)!.push(b._id);
  }

  const duplicateIds = new Set<string>();
  const duplicateGroups: string[][] = [];
  const personCounts = new Map<string, number>();

  for (const [key, ids] of byPerson) {
    personCounts.set(key, ids.length);
    if (ids.length > 1) {
      duplicateGroups.push(ids);
      ids.forEach(id => duplicateIds.add(id));
    }
  }

  return { duplicateIds, personCounts, duplicateGroups };
}

export function getDuplicateLabel(count: number) {
  return count > 1 ? `${count} same client` : "";
}
