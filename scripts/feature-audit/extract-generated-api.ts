import fs from 'node:fs';
import path from 'node:path';
import { Project, SyntaxKind, VariableDeclaration } from 'ts-morph';

export function extractGeneratedApi(endpointsDir: string) {
  const endpoints: any[] = [];
  if (!fs.existsSync(endpointsDir)) return endpoints;

  const project = new Project();
  project.addSourceFilesAtPaths(path.join(endpointsDir, '**/*.ts'));

  let foundKnownEndpoint = false;

  for (const sourceFile of project.getSourceFiles()) {
    const fileName = path.basename(sourceFile.getFilePath());

    // Find all variable declarations
    const vars = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration);
    for (const v of vars) {
      const name = v.getName();
      if (!name) continue;

      // Orval generates endpoints like `apiExamV2AppSearchQueryEsSubjectListGet`
      // They usually are exported consts initializing an arrow function that calls orvalRequest
      if (name.startsWith('use') || name.startsWith('get')) {
        continue;
      }

      const initializer = v.getInitializerIfKind(SyntaxKind.ArrowFunction);
      if (!initializer) continue;

      const orvalRequestCall = initializer.getDescendantsOfKind(SyntaxKind.CallExpression)
        .find(c => c.getExpression().getText() === 'orvalRequest');

      if (!orvalRequestCall) continue;

      // Ensure it's exported
      const variableStatement = v.getFirstAncestorByKind(SyntaxKind.VariableStatement);
      if (!variableStatement || !variableStatement.isExported()) continue;

      // Now we have an endpoint
      let method = 'UNKNOWN';
      const args = orvalRequestCall.getArguments();
      if (args.length >= 2) {
        const configArg = args[1];
        if (configArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
          const obj = configArg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
          const methodProp = obj.getProperty('method');
          if (methodProp && methodProp.getKind() === SyntaxKind.PropertyAssignment) {
            const methodVal = methodProp.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializer();
            if (methodVal && methodVal.getKind() === SyntaxKind.StringLiteral) {
              method = methodVal.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue();
            }
          }
        }
      }

      let urlPath = 'UNKNOWN';
      // Look for the get...Url function
      const urlFuncName = `get${name.charAt(0).toUpperCase() + name.slice(1)}Url`;
      const urlVar = sourceFile.getVariableDeclaration(urlFuncName);
      if (urlVar) {
        const urlInit = urlVar.getInitializerIfKind(SyntaxKind.ArrowFunction);
        if (urlInit) {
          const returnStatement = urlInit.getDescendantsOfKind(SyntaxKind.ReturnStatement)[0];
          if (returnStatement) {
            const returnExpr = returnStatement.getExpression();
            if (returnExpr) {
              if (returnExpr.getKind() === SyntaxKind.StringLiteral) {
                 urlPath = returnExpr.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue();
               } else if (returnExpr.getKind() === SyntaxKind.TemplateExpression || returnExpr.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
                 urlPath = returnExpr.getText().replace(/^`|`$/g, '');
               } else if (returnExpr.getKind() === SyntaxKind.ConditionalExpression) {
                 const whenFalse = returnExpr.asKindOrThrow(SyntaxKind.ConditionalExpression).getWhenFalse();
                 if (whenFalse.getKind() === SyntaxKind.StringLiteral) {
                   urlPath = whenFalse.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue();
                 } else if (whenFalse.getKind() === SyntaxKind.TemplateExpression || whenFalse.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
                   urlPath = whenFalse.getText().replace(/^`|`$/g, '');
                 } else {
                   // Fallback regex
                   const match = returnExpr.getText().match(/`([^`]+)`/);
                   if (match) urlPath = match[1].split('?')[0];
                 }
               }
            }
          }
        }
      }

      // Find response type
      let responseType = 'UNKNOWN';
      const returnTypeNode = initializer.getReturnTypeNode();
      if (returnTypeNode && returnTypeNode.getKind() === SyntaxKind.TypeReference) {
        const typeRef = returnTypeNode.asKindOrThrow(SyntaxKind.TypeReference);
        if (typeRef.getTypeName().getText() === 'Promise') {
          const typeArgs = typeRef.getTypeArguments();
          if (typeArgs.length > 0) {
             responseType = typeArgs[0].getText();
          }
        }
      }
      
      // JSDoc summary
      let summary = '';
      const responseTypeName = `${name}Response200`; // Orval generates type aliases for responses
      const typeAlias = sourceFile.getTypeAlias(responseTypeName);
      if (typeAlias) {
        const jsDocs = typeAlias.getJsDocs();
        if (jsDocs.length > 0) {
          const tags = jsDocs[0].getTags();
          const summaryTag = tags.find(t => t.getTagName() === 'summary');
          if (summaryTag) {
            summary = summaryTag.getCommentText()?.trim() || '';
          }
        }
      }

      if (method === 'UNKNOWN' || urlPath === 'UNKNOWN') {
        throw new Error(`Failed to extract method or path for endpoint ${name}`);
      }

      if (!responseType || responseType === 'UNKNOWN') {
        throw new Error(`Failed to extract response type for endpoint ${name}`);
      }

      endpoints.push({
        name,
        method: method.toUpperCase(),
        path: urlPath,
        summary,
        responseType,
        sourceFile: fileName,
      });

      if (name === 'apiExamV2AppSearchQueryEsSubjectListGet') {
        foundKnownEndpoint = true;
      }
    }
  }
  
  if (endpoints.length === 0) {
    throw new Error('No endpoints extracted. The extraction might be failing silently.');
  }

  // Check duplicates
  const names = endpoints.map(e => e.name);
  const duplicates = names.filter((item, index) => names.indexOf(item) !== index);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate endpoints found: ${duplicates.join(', ')}`);
  }
  
  if (!foundKnownEndpoint && endpoints.some(e => e.sourceFile.includes('examination-manager-v2'))) {
    throw new Error('Could not find known endpoint: apiExamV2AppSearchQueryEsSubjectListGet');
  }

  return endpoints;
}

if (require.main === module) {
  const result = extractGeneratedApi(path.join(process.cwd(), 'src/shared/api/generated/endpoints'));
  fs.mkdirSync(path.join(process.cwd(), 'docs/feature-audit'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'docs/feature-audit/generated-api-manifest.json'), JSON.stringify(result, null, 2));
}
