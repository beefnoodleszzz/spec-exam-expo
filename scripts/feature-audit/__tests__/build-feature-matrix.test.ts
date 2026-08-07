import { buildFeatureMatrix } from '../build-feature-matrix';

describe('buildFeatureMatrix', () => {
  it('should throw if LEGACY_ROOT is not set', () => {
    const original = process.env.LEGACY_ROOT;
    delete process.env.LEGACY_ROOT;
    expect(() => buildFeatureMatrix()).toThrow();
    process.env.LEGACY_ROOT = original;
  });
});
