import { extractLegacyFeatures } from '../extract-legacy-features';

describe('extractLegacyFeatures', () => {
  it('should throw if LEGACY_ROOT is invalid', () => {
    expect(() => extractLegacyFeatures('')).toThrow();
    expect(() => extractLegacyFeatures('non-existent')).toThrow();
  });
});
