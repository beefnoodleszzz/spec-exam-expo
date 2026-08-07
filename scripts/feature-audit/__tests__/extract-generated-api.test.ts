import { extractGeneratedApi } from '../extract-generated-api';

describe('extractGeneratedApi', () => {
  it('should return empty array if dir does not exist', () => {
    expect(extractGeneratedApi('non-existent')).toEqual([]);
  });
});
