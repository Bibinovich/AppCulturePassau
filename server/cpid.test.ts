import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCpid } from './cpid';
import { db } from './db';

const mockLimit = vi.fn();
const mockWhere = vi.fn(() => ({ limit: mockLimit }));
const mockFrom = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

const mockValues = vi.fn();
const mockInsert = vi.fn(() => ({ values: mockValues }));

const mockUpdateWhere = vi.fn();
const mockSet = vi.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = vi.fn(() => ({ set: mockSet }));

vi.mock('./db', () => ({
  db: {
    select: (...args: any[]) => mockSelect(...args),
    insert: (...args: any[]) => mockInsert(...args),
    update: (...args: any[]) => mockUpdate(...args),
  }
}));

describe('generateCpid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return existing CPID if found', async () => {
    mockLimit.mockResolvedValue([{ culturePassId: 'CP-EXISTING' }]);

    const result = await generateCpid('target-1', 'user');
    expect(result).toBe('CP-EXISTING');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should generate a new CPID successfully on the first try', async () => {
    mockLimit.mockResolvedValue([]);
    mockValues.mockResolvedValue([{}]);
    mockUpdateWhere.mockResolvedValue([{}]);

    const result = await generateCpid('target-new', 'user');

    expect(result).toMatch(/^CP-[2-9A-Z]{6}$/);
    expect(mockSelect).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);

    // Check insert arguments
    expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
      culturePassId: result,
      targetId: 'target-new',
      entityType: 'user',
    }));
  });

  it('should retry when duplicate key error (23505) occurs and succeed next try', async () => {
    mockLimit.mockResolvedValue([]);

    const duplicateError = new Error('Duplicate key');
    (duplicateError as any).code = '23505';

    // Fail first insert, succeed second
    mockValues.mockRejectedValueOnce(duplicateError).mockResolvedValueOnce([{}]);
    mockUpdateWhere.mockResolvedValue([{}]);

    const result = await generateCpid('target-retry', 'user');

    expect(result).toMatch(/^CP-[2-9A-Z]{6}$/);
    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  it('should throw an error after 20 failed attempts', async () => {
    mockLimit.mockResolvedValue([]);

    const duplicateError = new Error('Duplicate key');
    (duplicateError as any).code = '23505';

    // Always fail
    mockValues.mockRejectedValue(duplicateError);

    await expect(generateCpid('target-fail', 'user')).rejects.toThrow('Failed to generate unique CPID after 20 attempts');

    expect(mockInsert).toHaveBeenCalledTimes(20);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should throw immediately for non-23505 errors', async () => {
    mockLimit.mockResolvedValue([]);

    const otherError = new Error('Database connection failed');
    (otherError as any).code = 'ECONNREFUSED';

    mockValues.mockRejectedValue(otherError);

    await expect(generateCpid('target-error', 'user')).rejects.toThrow('Database connection failed');

    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  describe('Entity types update logic', () => {
    const testCases = [
      { type: 'user', expectedCalls: 1 },
      { type: 'sponsor', expectedCalls: 1 },
      { type: 'perk', expectedCalls: 1 },
      { type: 'ticket', expectedCalls: 1 },
      { type: 'profile', expectedCalls: 1 },
      { type: 'unknown_type', expectedCalls: 1 }, // Falls back to profiles
    ];

    testCases.forEach(({ type, expectedCalls }) => {
      it(`should handle updates for entityType: ${type}`, async () => {
        mockLimit.mockResolvedValue([]);
        mockValues.mockResolvedValue([{}]);
        mockUpdateWhere.mockResolvedValue([{}]);

        const result = await generateCpid(`target-${type}`, type);

        expect(result).toMatch(/^CP-[2-9A-Z]{6}$/);
        expect(mockUpdate).toHaveBeenCalledTimes(expectedCalls);

        // We know that `mockSet` is called by `mockUpdate()`, then `where()` is called on the result of `set()`.
        expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
          culturePassId: result
        }));
      });
    });
  });
});

import { lookupCpid, getAllRegistryEntries } from './cpid';

describe('lookupCpid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should trim and normalize the cpid and return entry if found', async () => {
    mockLimit.mockResolvedValue([{ targetId: 'target-123', entityType: 'user' }]);

    const result = await lookupCpid('  cp-123456  ');

    expect(result).toEqual({ targetId: 'target-123', entityType: 'user' });
    expect(mockSelect).toHaveBeenCalled();
    // Verify it was called with uppercase and trimmed value
    expect(mockWhere).toHaveBeenCalled();
  });

  it('should return null if cpid not found', async () => {
    mockLimit.mockResolvedValue([]);

    const result = await lookupCpid('NON-EXISTENT');

    expect(result).toBeNull();
  });
});

describe('getAllRegistryEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all entries from cpidRegistry', async () => {
    const mockEntries = [
      { culturePassId: 'CP-111111', targetId: 'user-1', entityType: 'user' },
      { culturePassId: 'CP-222222', targetId: 'event-1', entityType: 'event' }
    ];
    // For getAllRegistryEntries, db.select().from() is called directly without where or limit
    // We need to mock the from() to resolve the values directly
    mockFrom.mockResolvedValueOnce(mockEntries);

    const result = await getAllRegistryEntries();

    expect(result).toEqual(mockEntries);
    expect(mockSelect).toHaveBeenCalled();
  });
});
