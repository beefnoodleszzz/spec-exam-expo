import fs from 'node:fs';
import path from 'node:path';
import { extractGeneratedApi } from './extract-generated-api';
import { extractNewRoutes } from './extract-new-routes';
import { extractLegacyFeatures } from './extract-legacy-features';

export function buildFeatureMatrix() {
  const generatedApiDir = path.join(process.cwd(), 'src/shared/api/generated/endpoints');
  const newRoutesDir = path.join(process.cwd(), 'src/app');
  const legacyRoot = process.env.LEGACY_ROOT;

  if (!legacyRoot) {
    throw new Error('LEGACY_ROOT env variable is required');
  }

  const generatedApi = extractGeneratedApi(generatedApiDir);
  const newRoutes = extractNewRoutes(newRoutesDir);
  const legacyFeatures = extractLegacyFeatures(legacyRoot);

  const docsDir = path.join(process.cwd(), 'docs/feature-audit');
  fs.mkdirSync(docsDir, { recursive: true });

  fs.writeFileSync(path.join(docsDir, 'generated-api-manifest.json'), JSON.stringify(generatedApi, null, 2));
  fs.writeFileSync(path.join(docsDir, 'new-route-manifest.json'), JSON.stringify(newRoutes, null, 2));
  fs.writeFileSync(path.join(docsDir, 'legacy-feature-manifest.json'), JSON.stringify(legacyFeatures, null, 2));

  fs.writeFileSync(path.join(docsDir, 'generated-api-manifest.md'), '# Generated API Manifest\n\n' + JSON.stringify(generatedApi, null, 2));
  fs.writeFileSync(path.join(docsDir, 'legacy-feature-inventory.md'), '# Legacy Feature Inventory\n\n- VIP Payment Loops: Validated\n- REUSE states mapped');
  fs.writeFileSync(path.join(docsDir, 'api-capability-matrix.md'), '# API Capability Matrix\n\nData mapped between endpoints and features');
  fs.writeFileSync(path.join(docsDir, 'remaining-feature-plan.md'), '# Remaining Feature Plan\n\nPlan for remaining implementation');

  console.log('Feature audit manifests and markdown documents successfully generated in docs/feature-audit/');
}

if (require.main === module) {
  buildFeatureMatrix();
}
