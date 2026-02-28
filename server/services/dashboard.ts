import type { Ticket } from "@shared/schema";

export interface EventStats {
  eventId: string;
  eventTitle: string;
  tickets: number;
  revenue: number;
  scanned: number;
  organizerAmount: number;
}

export function calculateEventBreakdown(tickets: Ticket[]): EventStats[] {
  const eventMap = new Map<string, EventStats>();

  for (const t of tickets) {
    const existing = eventMap.get(t.eventId) || {
      eventId: t.eventId,
      eventTitle: t.eventTitle,
      tickets: 0,
      revenue: 0,
      scanned: 0,
      organizerAmount: 0
    };

    existing.tickets += (t.quantity || 1);
    existing.revenue += (t.totalPrice || 0);
    existing.organizerAmount += (t.organizerAmount || 0);

    if (t.status === 'used') {
      existing.scanned += (t.quantity || 1);
    }

    eventMap.set(t.eventId, existing);
  }

  return Array.from(eventMap.values()).sort((a, b) => b.revenue - a.revenue);
}
