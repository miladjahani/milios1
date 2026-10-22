// ============================================================================
// miliconfigOS v4.0 - deterministic module bundler for Cloudflare Workers/Pages
// Concatenates the ordered source modules, then emits:
//   dist/_worker.js          Pages `_worker.js` (obfuscated, deployable)
//   public/_worker.js        static-asset copy for Pages uploads
//   _worker.js               root artifact used by the repository deploy flow
//   build/worker.readable.js unminified bundle for debugging (never uploaded)
// The script never rewrites wrangler.toml and never writes stray copies into
// the repository root, so builds are reproducible and reviewable.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { obfuscateWorkerBundle } from './obfuscate.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Exact module order for the single-file Worker bundle.
const MODULE_ORDER = [
  'src/config/sources.js',
  'src/config/defaults.js',
  'src/config/catalog.js',
  'src/config/presets.js',
  'src/core/utils.js',
  'src/core/security.js',
  'src/config/schema.js',
  'src/core/health.js',
  'src/core/engine.js',
  'src/core/ech.js',
  'src/core/scanner.js',
  'src/ui/icons.js',
  'src/db/d1.js',
  'src/db/v4.js',
  'src/core/automation.js',
  'src/subscription/converters.js',
  'src/subscription/generator.js',
  'src/core/runtime.js',
  'src/api/handlers.js',
  'src/api/v1.js',
  'src/ui/loginHtml.js',
  'src/ui/statusHtml.js',
  'src/ui/adminHtml.js',
  'src/index.js'
];

function stripLocalImportsAndExports(code, isEntryPoint = false) {
  const lines = code.split('\n');
  const out = [];
  let skipMultiLineImport = false;

  for (let line of lines) {
    const trimmed = line.trim();

    if (skipMultiLineImport) {
      if (trimmed.includes('from ') && (trimmed.endsWith(';') || trimmed.endsWith("'") || trimmed.endsWith('"'))) {
        skipMultiLineImport = false;
      }
      continue;
    }

    // The bundle always provides its own `cloudflare:sockets` import header.
    if (/^import\s+.*from\s+['"]cloudflare:sockets['"]/.test(trimmed)) {
      continue;
    }

    if (/^import\s+/.test(trimmed)) {
      if (!trimmed.includes('from ')) skipMultiLineImport = true;
      continue;
    }

    if (!isEntryPoint && /^export\s+default\s+/.test(trimmed)) {
      line = line.replace(/^(\s*)export\s+default\s+/, '$1');
    } else if (/^export\s+(async\s+function|function|const|let|var|class)\s+/.test(trimmed)) {
      line = line.replace(/^(\s*)export\s+/, '$1');
    }

    out.push(line);
  }

  return out.join('\n');
}

function writeFileEnsured(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

async function buildAll() {
  console.log('⚡ [miliconfig] bundling modules...');

  const chunks = ["import { connect, connect as cfConnect } from 'cloudflare:sockets';\n"];

  for (const relPath of MODULE_ORDER) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(fullPath)) throw new Error(`missing module: ${relPath}`);
    const cleaned = stripLocalImportsAndExports(
      fs.readFileSync(fullPath, 'utf8'),
      relPath === 'src/index.js'
    );
    chunks.push(`// --- MODULE: ${relPath} ---\n${cleaned}\n`);
  }

  const rawBundle = chunks.join('\n');
  // Debug bundle stays outside the Pages upload directory: the deployment
  // directory must contain only what is meant to be public.
  writeFileEnsured(path.join(ROOT_DIR, 'build', 'worker.readable.js'), rawBundle);

  console.log('🔒 [miliconfig] applying minification/obfuscation...');
  const obfuscatedCode = await obfuscateWorkerBundle(rawBundle);

  // Rebuild dist from scratch so removed modules never linger in an upload.
  const distDir = path.join(ROOT_DIR, 'dist');
  fs.rmSync(distDir, { recursive: true, force: true });

  writeFileEnsured(path.join(distDir, '_worker.js'), obfuscatedCode);
  writeFileEnsured(path.join(ROOT_DIR, 'public', '_worker.js'), obfuscatedCode);
  writeFileEnsured(path.join(ROOT_DIR, '_worker.js'), obfuscatedCode);

  // Cloudflare Pages ignores dotfiles; keep the marker so the folder is a valid
  // static-asset deployment even when only the Worker file is present.
  writeFileEnsured(path.join(distDir, '.nojekyll'), '');
  writeFileEnsured(path.join(ROOT_DIR, 'public', '.nojekyll'), '');

  console.log(`✅ [miliconfig] build complete. Obfuscated bundle: ${(obfuscatedCode.length / 1024).toFixed(1)} KB`);
}

buildAll().catch(err => {
  console.error('❌ build failed:', err);
  process.exit(1);
});
