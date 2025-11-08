// validate-imports.js - Valida que todos los imports existan antes del deploy
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let errors = 0;
let warnings = 0;

console.log('🔍 Validando imports...\n');

/**
 * Extrae imports de un archivo JS
 */
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = [];

  // Match: import { something } from './path.js'
  const regex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Resuelve la ruta de un import
 */
function resolveImportPath(importPath, fromFile) {
  const fromDir = path.dirname(fromFile);

  // Ignorar imports externos (npm packages)
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null; // External package
  }

  let resolved;

  // Path absoluto desde la raíz del proyecto (ej: /js/config.js)
  if (importPath.startsWith('/')) {
    resolved = path.join(__dirname, importPath);
  } else {
    // Path relativo (ej: ./config.js)
    resolved = path.resolve(fromDir, importPath);
  }

  // Remover query strings (ej: ?v=123)
  resolved = resolved.split('?')[0];

  // Si no tiene extensión, asumir .js
  if (!path.extname(resolved)) {
    resolved += '.js';
  }

  return resolved;
}

/**
 * Valida un archivo JS
 */
function validateFile(filePath) {
  const relativePath = path.relative(__dirname, filePath);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no existe: ${relativePath}`);
    errors++;
    return;
  }

  const imports = extractImports(filePath);

  for (const importPath of imports) {
    const resolved = resolveImportPath(importPath, filePath);

    if (resolved && !fs.existsSync(resolved)) {
      console.error(`❌ Import roto en ${relativePath}:`);
      console.error(`   "${importPath}" -> ${path.relative(__dirname, resolved)}`);
      console.error(`   El archivo no existe!\n`);
      errors++;
    }
  }
}

/**
 * Encuentra todos los archivos JS en un directorio
 */
function findJsFiles(dir, ignorePatterns = ['node_modules', 'dist', 'public', '.git']) {
  const files = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Ignorar patrones
    if (ignorePatterns.some(pattern => fullPath.includes(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...findJsFiles(fullPath, ignorePatterns));
    } else if (entry.name.endsWith('.js') && !entry.name.includes('.example.')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Validar archivos principales
const jsDir = path.join(__dirname, 'js');
const dataDir = path.join(__dirname, 'data');

const jsFiles = findJsFiles(jsDir);
const dataFiles = findJsFiles(dataDir);

console.log(`📂 Validando ${jsFiles.length} archivos en /js/`);
jsFiles.forEach(validateFile);

console.log(`📂 Validando ${dataFiles.length} archivos en /data/`);
dataFiles.forEach(validateFile);

// Resumen
console.log('\n' + '='.repeat(50));
if (errors === 0) {
  console.log('✅ Todos los imports son válidos!');
  process.exit(0);
} else {
  console.log(`❌ Se encontraron ${errors} error(es)`);
  console.log('\n💡 Tip: Revisa los imports y asegúrate de que los archivos existan');
  process.exit(1);
}
