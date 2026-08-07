import fs from 'node:fs';
import path from 'node:path';
import { Project, SyntaxKind } from 'ts-morph';

export function extractLegacyFeatures(legacyRoot: string) {
  if (!legacyRoot) {
    throw new Error('LEGACY_ROOT is not provided or invalid');
  }

  const srcDir = path.join(legacyRoot, 'src');
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Invalid LEGACY_ROOT: ${srcDir} does not exist`);
  }

  const legacyFeatures: any[] = [];
  const project = new Project();
  project.addSourceFilesAtPaths(path.join(srcDir, '**/app.routes.tsx'));
  const sourceFiles = project.getSourceFiles();

  if (sourceFiles.length > 0) {
    const sourceFile = sourceFiles[0];
    
    // Look for JSX Elements with name attr, typically Scene or similar
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);
    for (const jsx of jsxElements) {
      const opening = jsx.getOpeningElement();
      const nameAttr = opening.getAttribute('name');
      if (nameAttr && nameAttr.getKind() === SyntaxKind.JsxAttribute) {
        const init = nameAttr.asKindOrThrow(SyntaxKind.JsxAttribute).getInitializer();
        if (init && init.getKind() === SyntaxKind.StringLiteral) {
          legacyFeatures.push({ name: init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue() });
        }
      }
    }
    
    const jsxSelfClosed = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    for (const jsx of jsxSelfClosed) {
      const nameAttr = jsx.getAttribute('name');
      if (nameAttr && nameAttr.getKind() === SyntaxKind.JsxAttribute) {
        const init = nameAttr.asKindOrThrow(SyntaxKind.JsxAttribute).getInitializer();
        if (init && init.getKind() === SyntaxKind.StringLiteral) {
          legacyFeatures.push({ name: init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue() });
        }
      }
    }
  }

  // Deduplicate
  const uniqueFeatures = Array.from(new Set(legacyFeatures.map(f => f.name))).map(name => ({ name }));
  return uniqueFeatures;
}

if (require.main === module) {
  let legacyRoot = process.env.LEGACY_ROOT;
  if (!legacyRoot) {
    const mockRoot = path.join(process.cwd(), 'scripts/feature-audit/fixtures/legacy');
    if (fs.existsSync(mockRoot)) {
      legacyRoot = mockRoot;
    } else {
      throw new Error('LEGACY_ROOT env variable is required');
    }
  }
  const result = extractLegacyFeatures(legacyRoot);
  fs.mkdirSync(path.join(process.cwd(), 'docs/feature-audit'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'docs/feature-audit/legacy-feature-manifest.json'), JSON.stringify(result, null, 2));
}
