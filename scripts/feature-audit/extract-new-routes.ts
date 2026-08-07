import fs from 'node:fs';
import path from 'node:path';

export function extractNewRoutes(appDir: string) {
  const routes: any[] = [];
  if (!fs.existsSync(appDir)) return routes;

  const files = fs.readdirSync(appDir, { recursive: true }) as string[];
  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    
    routes.push({
      file,
      protected: file.includes('(protected)'),
      public: file.includes('(public)'),
    });
  }
  return routes;
}

if (require.main === module) {
  const result = extractNewRoutes(path.join(process.cwd(), 'src/app'));
  fs.mkdirSync(path.join(process.cwd(), 'docs/feature-audit'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'docs/feature-audit/new-route-manifest.json'), JSON.stringify(result, null, 2));
}
