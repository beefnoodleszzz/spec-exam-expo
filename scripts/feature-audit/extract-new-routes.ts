import fs from 'node:fs';
import path from 'node:path';
import { Project, SyntaxKind } from 'ts-morph';

export function extractNewRoutes(appDir: string) {
  const routes: any[] = [];
  if (!fs.existsSync(appDir)) return routes;

  const project = new Project();
  project.addSourceFilesAtPaths(path.join(appDir, '**/*.tsx'));

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    const relativePath = path.relative(appDir, filePath);
    
    // Normalize path to router-like string
    let routePath = '/' + relativePath.replace(/\\/g, '/').replace(/\.tsx$/, '');
    if (routePath.endsWith('/index')) {
      routePath = routePath.replace(/\/index$/, '');
    }
    
    const isProtected = routePath.includes('(protected)');
    const isPublic = routePath.includes('(public)');
    let type = 'page';
    if (routePath.endsWith('_layout')) type = 'layout';
    else if (routePath.includes('components/')) type = 'internal';

    // scan for router.push, Link, Tabs.Screen
    const reachableFrom: string[] = [];
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    for (const call of calls) {
      if (call.getExpression().getText() === 'router.push' || call.getExpression().getText() === 'router.replace') {
        const args = call.getArguments();
        if (args.length > 0 && args[0].getKind() === SyntaxKind.StringLiteral) {
          reachableFrom.push(args[0].asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue());
        }
      }
    }

    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
    for (const jsx of jsxElements) {
      if (jsx.getTagNameNode().getText() === 'Link') {
        const href = jsx.getAttribute('href');
        if (href && href.getKind() === SyntaxKind.JsxAttribute) {
          const init = href.asKindOrThrow(SyntaxKind.JsxAttribute).getInitializer();
          if (init && init.getKind() === SyntaxKind.StringLiteral) {
            reachableFrom.push(init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue());
          }
        }
      }
    }
    
    const jsxSelfClosed = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    for (const jsx of jsxSelfClosed) {
      if (jsx.getTagNameNode().getText() === 'Tabs.Screen') {
        const nameAttr = jsx.getAttribute('name');
        if (nameAttr && nameAttr.getKind() === SyntaxKind.JsxAttribute) {
          const init = nameAttr.asKindOrThrow(SyntaxKind.JsxAttribute).getInitializer();
          if (init && init.getKind() === SyntaxKind.StringLiteral) {
            reachableFrom.push(init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue());
          }
        }
      }
    }

    routes.push({
      routePath,
      file: relativePath,
      protected: isProtected,
      public: isPublic,
      type,
      reachable: reachableFrom,
    });
  }
  return routes;
}

if (require.main === module) {
  const result = extractNewRoutes(path.join(process.cwd(), 'src/app'));
  fs.mkdirSync(path.join(process.cwd(), 'docs/feature-audit'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'docs/feature-audit/new-route-manifest.json'), JSON.stringify(result, null, 2));
}
