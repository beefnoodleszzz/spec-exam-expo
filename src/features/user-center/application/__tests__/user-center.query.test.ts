import { describe, it, expect } from 'vitest';
import { userCenterKeys } from '../user-center.query';

describe('userCenterKeys', () => {
  it('should isolate learningSummary by examTypeId', () => {
    const key1 = userCenterKeys.learningSummary('typeA');
    const key2 = userCenterKeys.learningSummary('typeB');
    expect(key1).not.toEqual(key2);
    expect(key1).toEqual(['user-center', 'learningSummary', 'typeA']);
  });
});
