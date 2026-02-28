import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert';
import { rateLimit } from './errors';

describe('rateLimit', () => {
  const originalDateNow = Date.now;

  afterEach(() => {
    Date.now = originalDateNow;
  });

  test('should allow requests within limit', () => {
    const key = 'test-key-1';
    assert.strictEqual(rateLimit(key, 2, 1000), true);
    assert.strictEqual(rateLimit(key, 2, 1000), true);
  });

  test('should block requests over limit', () => {
    const key = 'test-key-2';
    assert.strictEqual(rateLimit(key, 2, 1000), true);
    assert.strictEqual(rateLimit(key, 2, 1000), true);
    assert.strictEqual(rateLimit(key, 2, 1000), false);
  });

  test('should reset after windowMs', () => {
    const key = 'test-key-3';
    let currentTime = 1000;
    Date.now = () => currentTime;

    // Use up limit
    assert.strictEqual(rateLimit(key, 2, 1000), true);
    assert.strictEqual(rateLimit(key, 2, 1000), true);
    assert.strictEqual(rateLimit(key, 2, 1000), false);

    // Advance time past windowMs
    currentTime += 1001;

    // Should allow again
    assert.strictEqual(rateLimit(key, 2, 1000), true);
  });

  test('should handle different keys independently', () => {
    assert.strictEqual(rateLimit('key-A', 1, 1000), true);
    assert.strictEqual(rateLimit('key-B', 1, 1000), true);

    assert.strictEqual(rateLimit('key-A', 1, 1000), false);
    assert.strictEqual(rateLimit('key-B', 1, 1000), false);
  });

  test('should fallback to default values', () => {
      const key = 'test-key-4';
      // default is maxRequests = 10
      for (let i=0; i<10; i++) {
          assert.strictEqual(rateLimit(key), true);
      }
      assert.strictEqual(rateLimit(key), false);
  });
});
