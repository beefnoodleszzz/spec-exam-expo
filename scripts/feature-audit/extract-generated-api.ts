import fs from 'node:fs';
import path from 'node:path';

export function extractGeneratedApi(endpointsDir: string) {
  const endpoints: any[] = [];
  if (!fs.existsSync(endpointsDir)) return endpoints;

  const files = fs.readdirSync(endpointsDir, { recursive: true }) as string[];
  for (const file of files) {
    if (!file.endsWith('.ts')) continue;
    const fullPath = path.join(endpointsDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    // Naive regex to find endpoints
    const methodMatch = content.match(/method:\s*'([^']+)'/i);
    const pathMatch = content.match(/url:\s*`([^`]+)`/i);
    
    if (methodMatch && pathMatch) {
      endpoints.push({
        method: methodMatch[1].toUpperCase(),
        path: pathMatch[1],
        sourceFile: file,
      });
    }
  }
  return endpoints;
}

if (require.main === module) {
  const result = extractGeneratedApi(path.join(process.cwd(), 'src/shared/api/generated/endpoints'));
  fs.mkdirSync(path.join(process.cwd(), 'docs/feature-audit'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'docs/feature-audit/generated-api-manifest.json'), JSON.stringify(result, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'docs/feature-audit/generated-api-manifest.md'), '# Generated API Manifest\n' + JSON.stringify(result, null, 2));
}
