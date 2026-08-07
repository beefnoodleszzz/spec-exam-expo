import { describe, expect, it } from 'vitest';
import { purchaseHistoryKeys } from './purchase-history.query';

describe('purchaseHistoryKeys', () => {
  it('should isolate list by userId', () => {
    const key1 = purchaseHistoryKeys.list('user-1');
    const key2 = purchaseHistoryKeys.list('user-2');
    
    expect(key1).not.toEqual(key2);
    expect(key1).toEqual(['purchase-history', 'list', 'user-1']);
  });
});

