import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lookupCpid } from './cpid';
import { db } from './db';
import { cpidRegistry } from '@shared/schema';

// Mock the db
vi.mock('./db', () => ({
  db: {
    select: vi.fn(),
  },
}));

// Mock drizzle-orm's eq to capture its arguments easily
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn((column, value) => ({ column, value })),
  };
});

import { eq } from 'drizzle-orm';

describe('lookupCpid', () => {
  const mockLimit = vi.fn();
  const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });

  beforeEach(() => {
    vi.clearAllMocks();
    (db.select as any).mockReturnValue({ from: mockFrom });
  });

  it('should return mapped targetId and entityType when CPID is found', async () => {
    mockLimit.mockResolvedValue([
      {
        culturePassId: 'CP-123456',
        targetId: 'target-123',
        entityType: 'user',
        id: 1,
      },
    ]);

    const result = await lookupCpid('CP-123456');

    expect(result).toEqual({ targetId: 'target-123', entityType: 'user' });

    expect(db.select).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith(cpidRegistry);
    expect(mockWhere).toHaveBeenCalled();
    expect(mockLimit).toHaveBeenCalledWith(1);

    // Check that eq was called with the correct value
    expect(eq).toHaveBeenCalledWith(cpidRegistry.culturePassId, 'CP-123456');
  });

  it('should return null when CPID is not found', async () => {
    mockLimit.mockResolvedValue([]);

    const result = await lookupCpid('INVALID-CPID');

    expect(result).toBeNull();
    expect(eq).toHaveBeenCalledWith(cpidRegistry.culturePassId, 'INVALID-CPID');
  });

  it('should normalize the input CPID by trimming and converting to uppercase', async () => {
    mockLimit.mockResolvedValue([
      {
        culturePassId: 'CP-NORMALIZED',
        targetId: 'target-456',
        entityType: 'sponsor',
        id: 2,
      },
    ]);

    const result = await lookupCpid('   cp-normalized  ');

    expect(result).toEqual({ targetId: 'target-456', entityType: 'sponsor' });

    // Check that eq received the normalized CPID
    expect(eq).toHaveBeenCalledWith(cpidRegistry.culturePassId, 'CP-NORMALIZED');
  });
});
