import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lookupCpid } from '../cpid';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { cpidRegistry } from '@shared/schema';

// Mock the db object from server/db
vi.mock('../db', () => {
  return {
    db: {
      select: vi.fn(),
    }
  };
});

// Mock drizzle-orm
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    eq: vi.fn(),
  };
});

// Mock shared schema to prevent actual db connection attempts if any
vi.mock('@shared/schema', () => {
  return {
    cpidRegistry: { culturePassId: 'cpidRegistry.culturePassId' },
    users: {},
    profiles: {},
    sponsors: {},
    perks: {},
    tickets: {},
  };
});


describe('lookupCpid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return targetId and entityType when CPID is found', async () => {
    // Mock the chain setup
    const mockEntry = { targetId: 'test-target-id', entityType: 'user' };
    const limitMock = vi.fn().mockResolvedValue([mockEntry]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });

    vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);
    vi.mocked(eq).mockReturnValue('mocked-eq-result' as any);

    const result = await lookupCpid('CP-123456');

    expect(result).toEqual({ targetId: 'test-target-id', entityType: 'user' });
    expect(db.select).toHaveBeenCalled();
    expect(fromMock).toHaveBeenCalledWith(cpidRegistry);
    expect(whereMock).toHaveBeenCalledWith('mocked-eq-result');
    expect(limitMock).toHaveBeenCalledWith(1);
    expect(eq).toHaveBeenCalledWith(cpidRegistry.culturePassId, 'CP-123456');
  });

  it('should normalize input (trim and uppercase)', async () => {
    const mockEntry = { targetId: 'test-target-id', entityType: 'user' };
    const limitMock = vi.fn().mockResolvedValue([mockEntry]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });

    vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

    await lookupCpid('   cp-lowercase   ');

    expect(eq).toHaveBeenCalledWith(cpidRegistry.culturePassId, 'CP-LOWERCASE');
  });

  it('should return null when CPID is not found', async () => {
    const limitMock = vi.fn().mockResolvedValue([]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });

    vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

    const result = await lookupCpid('CP-NOTFOUND');

    expect(result).toBeNull();
  });
});
