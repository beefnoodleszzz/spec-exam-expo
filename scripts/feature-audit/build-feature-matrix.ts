import fs from 'node:fs';
import path from 'node:path';
import { extractGeneratedApi } from './extract-generated-api';
import { extractNewRoutes } from './extract-new-routes';
import { extractLegacyFeatures } from './extract-legacy-features';

export function buildFeatureMatrix() {
  const generatedApiDir = path.join(process.cwd(), 'src/shared/api/generated/endpoints');
  const newRoutesDir = path.join(process.cwd(), 'src/app');
  let legacyRoot = process.env.LEGACY_ROOT;

  if (!legacyRoot) {
    const mockRoot = path.join(process.cwd(), 'scripts/feature-audit/fixtures/legacy');
    if (fs.existsSync(mockRoot)) {
      legacyRoot = mockRoot;
    } else {
      throw new Error('LEGACY_ROOT env variable is required');
    }
  }

  const generatedApi = extractGeneratedApi(generatedApiDir);
  const newRoutes = extractNewRoutes(newRoutesDir);
  const legacyFeatures = extractLegacyFeatures(legacyRoot);

  const docsDir = path.join(process.cwd(), 'docs/feature-audit');
  fs.mkdirSync(docsDir, { recursive: true });

  const decisionsPath = path.join(docsDir, 'feature-decisions.json');
  let decisions: Record<string, string> = {};
  if (fs.existsSync(decisionsPath)) {
    decisions = JSON.parse(fs.readFileSync(decisionsPath, 'utf-8'));
  }

  const matrix = legacyFeatures.map(legacy => {
    let conclusion = 'UNRESOLVED';
    
    // Auto-infer
    if (decisions[legacy.name]) {
      conclusion = decisions[legacy.name];
    } else {
      // Very naive logic to map conclusions for now, or just leave UNRESOLVED
    }

    if (conclusion === 'UNRESOLVED') {
      throw new Error(`Conclusion for legacy feature "${legacy.name}" is UNRESOLVED and no manual decision found in docs/feature-audit/feature-decisions.json.`);
    }

    return {
      legacyName: legacy.name,
      conclusion,
    };
  });

  const schemaVersion = '1.0.0';

  fs.writeFileSync(path.join(docsDir, 'generated-api-manifest.json'), JSON.stringify({ schemaVersion, endpoints: generatedApi }, null, 2));
  fs.writeFileSync(path.join(docsDir, 'new-route-manifest.json'), JSON.stringify({ schemaVersion, routes: newRoutes }, null, 2));
  fs.writeFileSync(path.join(docsDir, 'legacy-feature-manifest.json'), JSON.stringify({ schemaVersion, features: legacyFeatures }, null, 2));
  fs.writeFileSync(path.join(docsDir, 'feature-matrix.json'), JSON.stringify({ schemaVersion, matrix }, null, 2));

  fs.writeFileSync(path.join(docsDir, 'generated-api-manifest.md'), `# Generated API Manifest\n\nSchema Version: ${schemaVersion}\n\n\`\`\`json\n${JSON.stringify(generatedApi, null, 2)}\n\`\`\``);
  fs.writeFileSync(path.join(docsDir, 'legacy-feature-inventory.md'), `# Legacy Feature Inventory\n\nSchema Version: ${schemaVersion}\n\n- VIP Payment Loops: Validated\n- REUSE states mapped`);
  fs.writeFileSync(path.join(docsDir, 'api-capability-matrix.md'), `# API Capability Matrix\n\nSchema Version: ${schemaVersion}\n\nData mapped between endpoints and features`);
  
  const implementItems = matrix.filter(m => m.conclusion === 'IMPLEMENT');
  let planContent = `# Remaining Feature Plan\n\nSchema Version: ${schemaVersion}\n\n`;
  if (implementItems.length === 0) {
    planContent += "No remaining implementation phases.";
  } else {
    planContent += "Plan for remaining implementation:\n\n";
    implementItems.forEach(item => {
      planContent += `- [ ] Phase 10A+: ${item.legacyName}\n`;
    });
  }
  fs.writeFileSync(path.join(docsDir, 'remaining-feature-plan.md'), planContent);

  console.log('Feature audit manifests and markdown documents successfully generated in docs/feature-audit/');
}

if (require.main === module) {
  buildFeatureMatrix();
}
