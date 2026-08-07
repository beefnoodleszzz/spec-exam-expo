import { extractNewRoutes } from '../extract-new-routes';

describe('extractNewRoutes', () => {
  it('should return empty array if dir does not exist', () => {
    expect(extractNewRoutes('non-existent')).toEqual([]);
  });
});
