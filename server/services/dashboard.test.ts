import { describe, it, expect } from 'vitest';
import { calculateEventBreakdown } from './dashboard';
import type { Ticket } from '@shared/schema';

describe('calculateEventBreakdown', () => {
  it('should group tickets by eventId and calculate correct totals', () => {
    const mockTickets: Partial<Ticket>[] = [
      {
        eventId: 'event-1',
        eventTitle: 'First Event',
        quantity: 2,
        totalPrice: 100,
        organizerAmount: 90,
        status: 'used',
      },
      {
        eventId: 'event-1',
        eventTitle: 'First Event',
        quantity: 1,
        totalPrice: 50,
        organizerAmount: 45,
        status: 'confirmed',
      },
      {
        eventId: 'event-2',
        eventTitle: 'Second Event',
        quantity: 4,
        totalPrice: 200,
        organizerAmount: 180,
        status: 'used',
      },
    ];

    const result = calculateEventBreakdown(mockTickets as Ticket[]);

    expect(result).toHaveLength(2);

    // Results should be sorted by revenue descending
    expect(result[0].eventId).toBe('event-2');
    expect(result[0].revenue).toBe(200);
    expect(result[0].tickets).toBe(4);
    expect(result[0].scanned).toBe(4);
    expect(result[0].organizerAmount).toBe(180);

    expect(result[1].eventId).toBe('event-1');
    expect(result[1].revenue).toBe(150);
    expect(result[1].tickets).toBe(3);
    expect(result[1].scanned).toBe(2);
    expect(result[1].organizerAmount).toBe(135);
  });

  it('should handle missing quantity, totalPrice, and organizerAmount', () => {
    const mockTickets: Partial<Ticket>[] = [
      {
        eventId: 'event-1',
        eventTitle: 'First Event',
        // defaults: quantity 1, totalPrice 0, organizerAmount 0
        status: 'used',
      }
    ];

    const result = calculateEventBreakdown(mockTickets as Ticket[]);

    expect(result).toHaveLength(1);
    expect(result[0].revenue).toBe(0);
    expect(result[0].tickets).toBe(1);
    expect(result[0].scanned).toBe(1);
    expect(result[0].organizerAmount).toBe(0);
  });
});
