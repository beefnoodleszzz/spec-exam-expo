import fs from 'node:fs';
import path from 'node:path';
import { Project, SyntaxKind, ObjectLiteralExpression } from 'ts-morph';

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
    
    // Parse array literal declarations (like spec-exam-pure's appRoutes object list)
    const appRoutesDecl = sourceFile.getVariableDeclaration('appRoutes');
    if (appRoutesDecl) {
      const init = appRoutesDecl.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
      if (init) {
        init.getElements().forEach(element => {
          if (element.getKind() === SyntaxKind.ObjectLiteralExpression) {
            const obj = element as ObjectLiteralExpression;
            const nameProp = obj.getProperty('name');
            if (nameProp && nameProp.getKind() === SyntaxKind.PropertyAssignment) {
              const nameInit = nameProp.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializer();
              if (nameInit && nameInit.getKind() === SyntaxKind.StringLiteral) {
                legacyFeatures.push({ 
                  featureId: nameInit.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue(),
                  name: nameInit.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue(),
                  legacyRoute: nameInit.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue(),
                  legacyPage: '',
                  legacyServiceFiles: [],
                  legacyApiLiterals: [],
                  entryFiles: [],
                  platformConstraints: []
                });
              }
            }
          }
        });
      }
    }
    
    // Fallback: Parse JSX Scene elements (like the mock fixture)
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);
    for (const jsx of jsxElements) {
      const opening = jsx.getOpeningElement();
      const nameAttr = opening.getAttribute('name');
      if (nameAttr && nameAttr.getKind() === SyntaxKind.JsxAttribute) {
        const init = nameAttr.asKindOrThrow(SyntaxKind.JsxAttribute).getInitializer();
        if (init && init.getKind() === SyntaxKind.StringLiteral) {
          legacyFeatures.push({ 
            featureId: init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue(),
            name: init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue(),
            legacyRoute: init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue(),
            legacyPage: '',
            legacyServiceFiles: [],
            legacyApiLiterals: [],
            entryFiles: [],
            platformConstraints: []
          });
        }
      }
    }

    const jsxSelfClosed = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    for (const jsx of jsxSelfClosed) {
      const nameAttr = jsx.getAttribute('name');
      if (nameAttr && nameAttr.getKind() === SyntaxKind.JsxAttribute) {
        const init = nameAttr.asKindOrThrow(SyntaxKind.JsxAttribute).getInitializer();
        if (init && init.getKind() === SyntaxKind.StringLiteral) {
          legacyFeatures.push({ 
            featureId: init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue(),
            name: init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue(),
            legacyRoute: init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue(),
            legacyPage: '',
            legacyServiceFiles: [],
            legacyApiLiterals: [],
            entryFiles: [],
            platformConstraints: []
          });
        }
      }
    }
  }

  // Deduplicate
  const uniqueFeaturesMap = new Map();
  legacyFeatures.forEach(f => uniqueFeaturesMap.set(f.name, f));
  return Array.from(uniqueFeaturesMap.values());
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
  fs.writeFileSync(path.join(process.cwd(), 'docs/feature-audit/legacy-feature-manifest.json'), JSON.stringify({ schemaVersion: "1.0.0", features: result }, null, 2));
}
