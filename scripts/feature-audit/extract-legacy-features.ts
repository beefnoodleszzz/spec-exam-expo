import fs from 'node:fs';
import path from 'node:path';

export function extractLegacyFeatures(legacyRoot: string) {
  if (!legacyRoot) {
    throw new Error('LEGACY_ROOT is not provided or invalid');
  }

  const srcDir = path.join(legacyRoot, 'src');
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Invalid LEGACY_ROOT: ${srcDir} does not exist`);
  }

  const legacyFeatures: any[] = [];
  const routesFile = path.join(srcDir, 'app.routes.tsx');
  if (fs.existsSync(routesFile)) {
    const content = fs.readFileSync(routesFile, 'utf-8');
    const matches = content.match(/name=['"]([^'"]+)['"]/g);
    if (matches) {
      for (const match of matches) {
        legacyFeatures.push({ name: match.replace(/name=['"]|['"]/g, '') });
      }
    }
  }

  return legacyFeatures;
}

if (require.main === module) {
  const legacyRoot = process.env.LEGACY_ROOT;
  if (!legacyRoot) {
    throw new Error('LEGACY_ROOT env variable is required');
  }
  const result = extractLegacyFeatures(legacyRoot);
  fs.mkdirSync(path.join(process.cwd(), 'docs/feature-audit'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'docs/feature-audit/legacy-feature-manifest.json'), JSON.stringify(result, null, 2));
}
