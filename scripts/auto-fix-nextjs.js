const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Patternuri pentru detectarea importurilor dinamice problematice
const dynamicImportPatterns = [
  {
    // Lazy import fără funcție arrow
    pattern: /const\s+(\w+)\s*=\s*lazy\s*\(\s*import\s*\(\s*['"](.*?)['"]\s*\)\s*\)/g,
    replacement: (match, componentName, importPath) => 
      `const ${componentName} = lazy(() => import('${importPath}'))`
  },
  {
    // Dynamic import fără loading fallback
    pattern: /const\s+(\w+)\s*=\s*dynamic\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"](.*?)['"]\s*\)\s*\)/g,
    replacement: (match, componentName, importPath) => 
      `const ${componentName} = dynamic(() => import('${importPath}'), { 
  loading: () => <LoadingFallback />,
  ssr: true
})`
  },
  {
    // Dynamic import fără funcție arrow
    pattern: /const\s+(\w+)\s*=\s*dynamic\s*\(\s*import\s*\(\s*['"](.*?)['"]\s*\)\s*\)/g,
    replacement: (match, componentName, importPath) => 
      `const ${componentName} = dynamic(() => import('${importPath}'), { 
  loading: () => <LoadingFallback />,
  ssr: true
})`
  }
];

// Creează componenta LoadingFallback dacă nu există
async function createLoadingFallback() {
  const dir = path.join(process.cwd(), 'src/components/ui');
  const filePath = path.join(dir, 'LoadingFallback.tsx');
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    const content = `import React from 'react';

export default function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4 w-full h-full min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}
`;
    
    await writeFile(filePath, content);
    console.log(`✅ Creat componenta LoadingFallback la: ${filePath}`);
  }
}

// Funcție pentru a verifica și corecta fișierele
async function processFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    let originalContent = content;
    let needsLoadingImport = false;
    
    // Aplică toate patternurile de înlocuire
    for (const { pattern, replacement } of dynamicImportPatterns) {
      if (pattern.test(content)) {
        console.log(`🔍 Găsit import dinamic problematic în: ${filePath}`);
        content = content.replace(pattern, replacement);
        needsLoadingImport = true;
      }
    }
    
    // Adaugă importul pentru LoadingFallback dacă este necesar
    if (needsLoadingImport && !content.includes('import LoadingFallback')) {
      content = content.replace(
        /import\s+.*?\s+from\s+['"].*?['"]\s*;/,
        (match) => `${match}\nimport LoadingFallback from '@/components/ui/LoadingFallback';`
      );
    }
    
    // Salvează fișierul modificat dacă au fost făcute schimbări
    if (content !== originalContent) {
      await writeFile(filePath, content);
      console.log(`✅ Corectat fișierul: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Eroare la procesarea fișierului ${filePath}:`, error);
    return false;
  }
}

// Funcție pentru a verifica recursiv toate fișierele într-un director
async function scanAndFixDirectory(dir) {
  console.log(`📂 Scanez directorul: ${dir}`);
  let fixedFiles = 0;
  
  try {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === '.next') continue;
      
      const fullPath = path.join(dir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        fixedFiles += await scanAndFixDirectory(fullPath);
      } else if (stats.isFile() && (
        entry.endsWith('.js') || entry.endsWith('.jsx') || 
        entry.endsWith('.ts') || entry.endsWith('.tsx')
      )) {
        if (await processFile(fullPath)) {
          fixedFiles++;
        }
      }
    }
    
    return fixedFiles;
  } catch (error) {
    console.error(`❌ Eroare la scanarea directorului ${dir}:`, error);
    return fixedFiles;
  }
}

// Actualizează next.config.js pentru a asigura transpilarea corectă
async function updateNextConfig() {
  const filePath = path.join(process.cwd(), 'next.config.js');
  
  if (fs.existsSync(filePath)) {
    let content = await readFile(filePath, 'utf8');
    let originalContent = content;
    
    // Adaugă transpilePackages dacă nu există deja
    if (!content.includes('transpilePackages')) {
      content = content.replace(
        /module\.exports\s*=\s*{/,
        'module.exports = {\n  transpilePackages: [],\n  reactStrictMode: true,'
      );
    }
    
    // Verifică și adaugă swcMinify: false pentru a evita probleme de optimizare
    if (!content.includes('swcMinify')) {
      content = content.replace(
        /module\.exports\s*=\s*{/,
        'module.exports = {\n  swcMinify: false,'
      );
    }
    
    // Salvează fișierul dacă au fost făcute schimbări
    if (content !== originalContent) {
      await writeFile(filePath, content);
      console.log(`✅ Actualizat next.config.js pentru compatibilitate maximă`);
      return true;
    }
  } else {
    console.log(`❌ next.config.js nu a fost găsit!`);
  }
  
  return false;
}

// Funcția principală
async function main() {
  console.log('🛠️ Începe procesul de corectare automată a importurilor dinamice...');
  
  // 1. Crează componenta LoadingFallback
  await createLoadingFallback();
  
  // 2. Actualizează next.config.js
  await updateNextConfig();
  
  // 3. Scanează și corectează toate fișierele
  const srcDir = path.join(process.cwd(), 'src');
  if (fs.existsSync(srcDir)) {
    const fixedFiles = await scanAndFixDirectory(srcDir);
    console.log(`\n✅ Process finalizat! S-au corectat ${fixedFiles} fișiere.`);
  } else {
    console.error(`❌ Director src/ nu a fost găsit!`);
  }
  
  console.log('\n📝 Pași de urmat pentru finalizarea corectării:');
  console.log('1. Rulați: npm install');
  console.log('2. Rulați: npm run build');
  console.log('3. Rulați: npm run start');
  console.log('\nDacă încă întâmpinați probleme, verificați manual importurile dinamice în cod.');
}

main()
  .catch(error => {
    console.error('❌ Eroare în timpul procesului de corectare:', error);
  }); 