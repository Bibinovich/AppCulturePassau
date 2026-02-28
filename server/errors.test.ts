import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wrapHandler, AppError, ErrorCodes } from './errors';
import type { Request, Response } from 'express';

describe('wrapHandler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    req = {};
    res = {
      status: statusMock as any,
      json: jsonMock as any,
    };

    // Silence console.error for tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call the handler successfully', async () => {
    const mockHandler = vi.fn().mockResolvedValue('success');
    const wrapped = wrapHandler(mockHandler);

    await wrapped(req as Request, res as Response);

    expect(mockHandler).toHaveBeenCalledWith(req, res);
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it('should handle AppError and return appropriate response', async () => {
    const error = new AppError(ErrorCodes.NOT_FOUND, 404, 'Resource not found');
    const mockHandler = vi.fn().mockRejectedValue(error);
    const wrapped = wrapHandler(mockHandler);

    await wrapped(req as Request, res as Response);

    expect(mockHandler).toHaveBeenCalledWith(req, res);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: { code: ErrorCodes.NOT_FOUND, message: 'Resource not found' }
    });
  });

  it('should handle generic errors, log them, and return a 500 response', async () => {
    const error = new Error('Some unexpected error');
    const mockHandler = vi.fn().mockRejectedValue(error);
    const wrapped = wrapHandler(mockHandler);

    await wrapped(req as Request, res as Response);

    expect(mockHandler).toHaveBeenCalledWith(req, res);
    expect(console.error).toHaveBeenCalledWith('Unhandled error:', error);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: { code: ErrorCodes.INTERNAL_ERROR, message: 'Something went wrong. Please try again.' }
    });
  });
});
