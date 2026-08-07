import fs from 'fs'
import path from 'path'

describe('NativeWind Global Configuration', () => {
  const rootDir = path.resolve(__dirname, '../..')

  it('Root Layout should import global.css', () => {
    const layoutPath = path.join(rootDir, 'src/app/_layout.tsx')
    const content = fs.readFileSync(layoutPath, 'utf8')
    expect(content).toMatch(/import\s+['"]\.\.\/\.\.\/global\.css['"]/)
  })

  it('metro.config.js should use withNativeWind and point to global.css', () => {
    const metroPath = path.join(rootDir, 'metro.config.js')
    const content = fs.readFileSync(metroPath, 'utf8')
    expect(content).toContain('withNativeWind')
    expect(content).toContain("input: './global.css'")
  })

  it('global.css should contain Tailwind directives', () => {
    const cssPath = path.join(rootDir, 'global.css')
    const content = fs.readFileSync(cssPath, 'utf8')
    expect(content).toContain('@tailwind base;')
    expect(content).toContain('@tailwind components;')
    expect(content).toContain('@tailwind utilities;')
  })

  it('tailwind.config.js should contain correct content and preset', () => {
    const tailwindPath = path.join(rootDir, 'tailwind.config.js')
    const content = fs.readFileSync(tailwindPath, 'utf8')
    expect(content).toMatch(/content:\s*\[[^\]]*'(\.\/)?src\/\*\*\/\*\.\{js,jsx,ts,tsx\}'[^\]]*\]/)
    expect(content).toContain("require('nativewind/preset')")
  })
})
