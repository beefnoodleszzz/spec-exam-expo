import { describe, it, expect } from 'vitest';
import { extractGeneratedApi } from '../extract-generated-api';
import { extractNewRoutes } from '../extract-new-routes';
import { extractLegacyFeatures } from '../extract-legacy-features';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('Extractors', () => {
  it('extracts generated api', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'api-'));
    fs.writeFileSync(path.join(tmpDir, 'test.ts'), 'export const useGetUser = () => {}; export const postData = () => {};');
    const result = extractGeneratedApi(tmpDir);
    expect(result).toContain('useGetUser');
    expect(result).toContain('postData');
  });

  it('extracts new routes', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routes-'));
    fs.writeFileSync(path.join(tmpDir, 'index.tsx'), 'content');
    const result = extractNewRoutes(tmpDir);
    expect(result).toContain('/index.tsx');
  });

  it('extracts legacy features', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacy-'));
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir);
    fs.writeFileSync(path.join(srcDir, 'App.tsx'), 'content');
    const result = extractLegacyFeatures(tmpDir);
    expect(result).toContain('/App.tsx');
  });
});
